from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import requests
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Query, Header
from fastapi.responses import Response as FastResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------- Config ----------------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_SECRET_CODE = os.environ['ADMIN_SECRET_CODE']
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_ALGORITHM = "HS256"
APP_NAME = "civicconnect"
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CivicConnect API")
api_router = APIRouter(prefix="/api")

# ---------------- Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def public_user(u: dict) -> dict:
    return {
        "id": u["id"], "name": u["name"], "email": u["email"],
        "mobile": u.get("mobile", ""), "role": u["role"],
        "points": u.get("points", 0), "badge": u.get("badge", "Bronze Reporter"),
        "created_at": u.get("created_at"),
    }

def compute_badge(points: int) -> str:
    if points >= 500: return "City Hero"
    if points >= 200: return "Gold Reporter"
    if points >= 100: return "Silver Reporter"
    return "Bronze Reporter"

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def set_auth_cookies(resp: Response, token: str):
    resp.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                    samesite="none", max_age=7 * 24 * 3600, path="/")

# ---------------- Object Storage ----------------
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage unavailable")
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage unavailable")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------- Models ----------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str

class AdminRegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    secret_code: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class IssueIn(BaseModel):
    title: str
    category: str
    description: str
    priority: str = "Medium"
    location_address: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []  # storage paths

class StatusUpdateIn(BaseModel):
    status: str
    remark: Optional[str] = ""
    officer_id: Optional[str] = None
    resolution_images: List[str] = []

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str

ISSUE_CATEGORIES = ["Pothole", "Garbage", "Streetlight", "Water Leakage", "Drainage",
                    "Road Damage", "Traffic Signal", "Public Property Damage", "Other"]
ISSUE_STATUSES = ["Pending", "Verified", "Assigned", "In Progress", "Resolved", "Rejected", "Closed"]

# ---------------- Startup ----------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.issues.create_index("complaint_id", unique=True)
    await db.issues.create_index("user_id")
    await db.notifications.create_index("user_id")
    init_storage()

    # Seed demo users
    # if not await db.users.find_one({"email": "admin@civicconnect.in"}):
    #     await db.users.insert_one({
    #         "id": str(uuid.uuid4()), "name": "Civic Admin", "email": "admin@civicconnect.in",
    #         "mobile": "0000000000", "password_hash": hash_password("Admin@123"),
    #         "role": "admin", "points": 0, "badge": "City Hero", "created_at": now_iso()
    #     })
    # if not await db.users.find_one({"email": "citizen@civicconnect.in"}):
    #     await db.users.insert_one({
    #         "id": str(uuid.uuid4()), "name": "Demo Citizen", "email": "citizen@civicconnect.in",
    #         "mobile": "9999999999", "password_hash": hash_password("Citizen@123"),
    #         "role": "citizen", "points": 60, "badge": "Bronze Reporter", "created_at": now_iso()
    #     })

    # Seed sample officers
    if await db.officers.count_documents({}) == 0:
        await db.officers.insert_many([
            {"id": str(uuid.uuid4()), "name": "Inspector R. Sharma", "department": "Public Works",
             "contact": "9000000001", "assigned_count": 0, "resolved_count": 0},
            {"id": str(uuid.uuid4()), "name": "Officer P. Verma", "department": "Sanitation",
             "contact": "9000000002", "assigned_count": 0, "resolved_count": 0},
            {"id": str(uuid.uuid4()), "name": "Engineer S. Iyer", "department": "Water Supply",
             "contact": "9000000003", "assigned_count": 0, "resolved_count": 0},
        ])

# ---------------- Auth Endpoints ----------------
@api_router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()), "name": payload.name, "email": email,
        "mobile": payload.mobile, "password_hash": hash_password(payload.password),
        "role": "citizen", "points": 0, "badge": "Bronze Reporter", "created_at": now_iso()
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], user["email"], "citizen")
    set_auth_cookies(response, token)
    return {"user": public_user(user), "token": token}

@api_router.post("/auth/admin-register")
async def admin_register(payload: AdminRegisterIn, response: Response):
    if payload.secret_code != ADMIN_SECRET_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin secret code")
    # Only allow if no admin exists OR only seeded one (allow user to claim primary admin)
    existing_admins = await db.users.count_documents({"role": "admin"})
    seeded = await db.users.find_one({"email": "admin@civicconnect.in"})
    if existing_admins >= 1 and not (existing_admins == 1 and seeded):
        raise HTTPException(status_code=403, detail="Admin already registered. Only one admin allowed.")
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()), "name": payload.name, "email": email,
        "mobile": "", "password_hash": hash_password(payload.password),
        "role": "admin", "points": 0, "badge": "City Hero", "created_at": now_iso()
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], user["email"], "admin")
    set_auth_cookies(response, token)
    return {"user": public_user(user), "token": token}

@api_router.get("/auth/admin-available")
async def admin_available():
    # True if no non-seeded admin exists
    count = await db.users.count_documents({"role": "admin", "email": {"$ne": "admin@civicconnect.in"}})
    return {"available": count == 0}

@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], user["email"], user["role"])
    set_auth_cookies(response, token)
    return {"user": public_user(user), "token": token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)

@api_router.post("/auth/forgot-password")
async def forgot_password(body: dict):
    email = (body.get("email") or "").lower()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token, "user_id": user["id"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            "used": False
        })
        logger.info(f"Password reset link: /reset-password?token={token}")
    return {"ok": True, "message": "If the email exists, a reset link has been sent."}

# ---------------- Uploads ----------------
@api_router.post("/uploads")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename or "img").split(".")[-1].lower() if "." in (file.filename or "") else "bin"
    path = f"{APP_NAME}/uploads/{user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 8MB)")
    content_type = file.content_type or "application/octet-stream"
    result = put_object(path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()), "storage_path": result["path"],
        "original_filename": file.filename, "content_type": content_type,
        "size": result.get("size", len(data)), "owner_id": user["id"],
        "is_deleted": False, "created_at": now_iso()
    })
    return {"path": result["path"], "size": result.get("size", len(data))}

@api_router.get("/files/{path:path}")
async def download_file(path: str, auth: Optional[str] = Query(None),
                        authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    elif auth:
        token = auth
    if not token:
        raise HTTPException(status_code=401, detail="Auth required")
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return FastResponse(content=data, media_type=record.get("content_type", content_type))

# ---------------- Issues ----------------
async def _gen_complaint_id():
    yyyy = datetime.now(timezone.utc).strftime("%Y")
    seq = await db.counters.find_one_and_update(
        {"_id": f"issue_{yyyy}"}, {"$inc": {"seq": 1}},
        upsert=True, return_document=True
    )
    n = seq.get("seq", 1) if seq else 1
    return f"CC-{yyyy}-{n:05d}"

async def _add_timeline(issue_id: str, status: str, remark: str = "", actor: str = "system"):
    await db.issues.update_one({"id": issue_id}, {"$push": {"timeline": {
        "status": status, "remark": remark, "actor": actor, "at": now_iso()
    }}})

async def _notify(user_id: str, title: str, message: str, issue_id: str = ""):
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()), "user_id": user_id, "title": title,
        "message": message, "issue_id": issue_id, "read": False, "created_at": now_iso()
    })

@api_router.post("/issues")
async def create_issue(payload: IssueIn, user: dict = Depends(get_current_user)):
    if payload.category not in ISSUE_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
    cid = await _gen_complaint_id()
    issue = {
        "id": str(uuid.uuid4()), "complaint_id": cid, "user_id": user["id"],
        "user_name": user["name"], "title": payload.title, "category": payload.category,
        "description": payload.description, "priority": payload.priority,
        "location_address": payload.location_address, "latitude": payload.latitude,
        "longitude": payload.longitude, "images": payload.images,
        "resolution_images": [], "status": "Pending", "officer_id": None,
        "officer_name": None, "remarks": [],
        "timeline": [{"status": "Pending", "remark": "Complaint submitted", "actor": user["name"], "at": now_iso()}],
        "created_at": now_iso(), "updated_at": now_iso()
    }
    await db.issues.insert_one(issue)
    # Award points
    new_points = user.get("points", 0) + 10
    await db.users.update_one({"id": user["id"]},
                              {"$set": {"points": new_points, "badge": compute_badge(new_points)}})
    await _notify(user["id"], "Complaint Submitted",
                  f"Your complaint {cid} has been received.", issue["id"])
    issue.pop("_id", None)
    return issue

@api_router.get("/issues")
async def list_issues(user: dict = Depends(get_current_user),
                      status: Optional[str] = None, category: Optional[str] = None,
                      priority: Optional[str] = None, q: Optional[str] = None,
                      all: bool = False):
    query = {}
    if not (user["role"] == "admin" and all):
        query["user_id"] = user["id"]
    if status: query["status"] = status
    if category: query["category"] = category
    if priority: query["priority"] = priority
    if q: query["$or"] = [{"title": {"$regex": q, "$options": "i"}},
                          {"complaint_id": {"$regex": q, "$options": "i"}},
                          {"location_address": {"$regex": q, "$options": "i"}}]
    issues = await db.issues.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return issues

@api_router.get("/issues/track/{complaint_id}")
async def track_issue(complaint_id: str):
    issue = await db.issues.find_one({"complaint_id": complaint_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return issue

@api_router.get("/issues/{issue_id}")
async def get_issue(issue_id: str, user: dict = Depends(get_current_user)):
    issue = await db.issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if user["role"] != "admin" and issue["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return issue

@api_router.patch("/issues/{issue_id}/status")
async def update_status(issue_id: str, payload: StatusUpdateIn, admin: dict = Depends(require_admin)):
    if payload.status not in ISSUE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    issue = await db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    update = {"status": payload.status, "updated_at": now_iso()}
    officer_name = None
    if payload.officer_id:
        officer = await db.officers.find_one({"id": payload.officer_id})
        if officer:
            update["officer_id"] = officer["id"]
            update["officer_name"] = officer["name"]
            officer_name = officer["name"]
    if payload.resolution_images:
        update["resolution_images"] = payload.resolution_images
    await db.issues.update_one({"id": issue_id}, {"$set": update})
    await _add_timeline(issue_id, payload.status, payload.remark or "", admin["name"])
    # Notification
    await _notify(issue["user_id"], f"Status: {payload.status}",
                  f"Your complaint {issue['complaint_id']} is now {payload.status}." +
                  (f" Assigned to {officer_name}." if officer_name else ""), issue_id)
    # Reward on resolution
    if payload.status == "Resolved":
        user = await db.users.find_one({"id": issue["user_id"]})
        if user:
            new_points = user.get("points", 0) + 25
            await db.users.update_one({"id": user["id"]},
                                      {"$set": {"points": new_points, "badge": compute_badge(new_points)}})
    return {"ok": True}

@api_router.get("/officers")
async def list_officers(admin: dict = Depends(require_admin)):
    return await db.officers.find({}, {"_id": 0}).to_list(200)

# ---------------- Stats ----------------
@api_router.get("/stats/user")
async def stats_user(user: dict = Depends(get_current_user)):
    base = {"user_id": user["id"]}
    total = await db.issues.count_documents(base)
    resolved = await db.issues.count_documents({**base, "status": "Resolved"})
    pending = await db.issues.count_documents({**base, "status": "Pending"})
    in_review = await db.issues.count_documents({**base, "status": {"$in": ["Verified", "Assigned", "In Progress"]}})
    return {"total": total, "resolved": resolved, "pending": pending, "in_review": in_review,
            "points": user.get("points", 0), "badge": user.get("badge", "Bronze Reporter")}

@api_router.get("/stats/admin")
async def stats_admin(admin: dict = Depends(require_admin)):
    users_count = await db.users.count_documents({"role": "citizen"})
    total = await db.issues.count_documents({})
    resolved = await db.issues.count_documents({"status": "Resolved"})
    pending = await db.issues.count_documents({"status": "Pending"})
    active = await db.issues.count_documents({"status": {"$in": ["Verified", "Assigned", "In Progress"]}})

    # Per category
    pipeline_cat = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    by_cat = await db.issues.aggregate(pipeline_cat).to_list(50)
    # Per status
    pipeline_status = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    by_status = await db.issues.aggregate(pipeline_status).to_list(50)
    # Last 7 days
    by_day = []
    for i in range(6, -1, -1):
        day = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        count = await db.issues.count_documents({"created_at": {"$regex": f"^{day}"}})
        by_day.append({"day": day, "count": count})
    return {
        "users": users_count, "total": total, "resolved": resolved,
        "pending": pending, "active": active,
        "by_category": [{"category": x["_id"], "count": x["count"]} for x in by_cat],
        "by_status": [{"status": x["_id"], "count": x["count"]} for x in by_status],
        "by_day": by_day
    }

# ---------------- Leaderboard / Community ----------------
@api_router.get("/leaderboard")
async def leaderboard():
    users = await db.users.find({"role": "citizen"}, {"_id": 0, "password_hash": 0}) \
        .sort("points", -1).limit(20).to_list(20)
    return [public_user(u) for u in users]

@api_router.get("/community/feed")
async def community_feed():
    issues = await db.issues.find({"status": "Resolved"}, {"_id": 0}) \
        .sort("updated_at", -1).limit(30).to_list(30)
    return issues

# ---------------- Notifications ----------------
@api_router.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    items = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}) \
        .sort("created_at", -1).limit(50).to_list(50)
    unread = await db.notifications.count_documents({"user_id": user["id"], "read": False})
    return {"items": items, "unread": unread}

@api_router.post("/notifications/{nid}/read")
async def mark_read(nid: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user["id"]}, {"$set": {"read": True}})
    return {"ok": True}

@api_router.post("/notifications/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return {"ok": True}

# ---------------- Contact ----------------
@api_router.post("/contact")
async def contact(payload: ContactIn):
    await db.contact_messages.insert_one({
        "id": str(uuid.uuid4()), "name": payload.name, "email": payload.email,
        "message": payload.message, "created_at": now_iso()
    })
    return {"ok": True, "message": "We'll get back to you within 48 hours."}

@api_router.get("/")
async def root():
    return {"app": "CivicConnect", "status": "online"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
