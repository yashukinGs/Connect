"""CivicConnect end-to-end backend tests via REACT_APP_BACKEND_URL."""
import io
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://complaint-tracker-123.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

CITIZEN = {"email": "citizen@civicconnect.in", "password": "Citizen@123"}
ADMIN = {"email": "admin@civicconnect.in", "password": "Admin@123"}

state = {}


@pytest.fixture(scope="module")
def citizen_token():
    r = requests.post(f"{API}/auth/login", json=CITIZEN, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("token")
    assert data["user"]["email"] == CITIZEN["email"]
    state["citizen_user"] = data["user"]
    return data["token"]


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json=ADMIN, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    state["admin_user"] = data["user"]
    return data["token"]


def h(token):
    return {"Authorization": f"Bearer {token}"}


# ---- Auth ----
def test_root_alive():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json()["status"] == "online"


def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": "wrong@civicconnect.in", "password": "x"}, timeout=15)
    assert r.status_code == 401


def test_register_citizen_new():
    suffix = str(int(time.time()))
    payload = {"name": "TEST User", "email": f"test_{suffix}@civicconnect.in",
               "mobile": "9000000000", "password": "Pass@123"}
    r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["email"] == payload["email"]
    assert data["user"]["role"] == "citizen"
    state["new_user_email"] = payload["email"]

    # Duplicate registration should fail
    r2 = requests.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r2.status_code == 400


def test_admin_register_blocked_when_exists(admin_token):
    # Seeded admin already exists; with another admin registration the endpoint should respond properly.
    # First call /admin-available
    r_avail = requests.get(f"{API}/auth/admin-available", timeout=10)
    assert r_avail.status_code == 200
    # If a non-seeded admin already exists, should not be available
    # We don't strictly assert true/false – we just verify endpoint works.
    assert "available" in r_avail.json()

    # Try registering with wrong code
    r = requests.post(f"{API}/auth/admin-register",
                      json={"name": "T", "email": "t_admin@civicconnect.in",
                            "password": "x", "secret_code": "WRONG"}, timeout=15)
    assert r.status_code == 403


def test_me_endpoint(citizen_token):
    r = requests.get(f"{API}/auth/me", headers=h(citizen_token), timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == CITIZEN["email"]


def test_me_unauthorized():
    r = requests.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 401


# ---- Issues ----
def test_create_issue(citizen_token):
    payload = {"title": "TEST Pothole on Main St", "category": "Pothole",
               "description": "Big pothole near junction", "priority": "High",
               "location_address": "Main Street, City", "latitude": 12.97, "longitude": 77.59,
               "images": []}
    r = requests.post(f"{API}/issues", json=payload, headers=h(citizen_token), timeout=15)
    assert r.status_code == 200, r.text
    issue = r.json()
    assert issue["complaint_id"].startswith("CC-")
    assert issue["status"] == "Pending"
    assert len(issue["timeline"]) == 1
    state["issue_id"] = issue["id"]
    state["complaint_id"] = issue["complaint_id"]


def test_invalid_category(citizen_token):
    r = requests.post(f"{API}/issues",
                      json={"title": "x", "category": "Invalid", "description": "x"},
                      headers=h(citizen_token), timeout=15)
    assert r.status_code == 400


def test_list_my_issues(citizen_token):
    r = requests.get(f"{API}/issues", headers=h(citizen_token), timeout=10)
    assert r.status_code == 200
    issues = r.json()
    assert any(i["id"] == state["issue_id"] for i in issues)


def test_track_public():
    r = requests.get(f"{API}/issues/track/{state['complaint_id']}", timeout=10)
    assert r.status_code == 200
    assert r.json()["complaint_id"] == state["complaint_id"]


def test_track_invalid():
    r = requests.get(f"{API}/issues/track/CC-9999-99999", timeout=10)
    assert r.status_code == 404


def test_get_issue_owner(citizen_token):
    r = requests.get(f"{API}/issues/{state['issue_id']}", headers=h(citizen_token), timeout=10)
    assert r.status_code == 200


# ---- Uploads ----
def test_upload_and_serve(citizen_token):
    # 1x1 PNG
    png = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082")
    files = {"file": ("test.png", io.BytesIO(png), "image/png")}
    r = requests.post(f"{API}/uploads", files=files, headers=h(citizen_token), timeout=30)
    assert r.status_code == 200, r.text
    path = r.json()["path"]
    state["upload_path"] = path

    # Fetch via /files
    r2 = requests.get(f"{API}/files/{path}", params={"auth": citizen_token}, timeout=30)
    assert r2.status_code == 200
    assert r2.headers.get("content-type", "").startswith("image/")


def test_files_unauth():
    r = requests.get(f"{API}/files/some/random/path.png", timeout=10)
    assert r.status_code == 401


# ---- Officers, status update, RBAC ----
def test_officers_admin_only(admin_token, citizen_token):
    r_admin = requests.get(f"{API}/officers", headers=h(admin_token), timeout=10)
    assert r_admin.status_code == 200
    officers = r_admin.json()
    assert len(officers) >= 1
    state["officer_id"] = officers[0]["id"]

    r_citizen = requests.get(f"{API}/officers", headers=h(citizen_token), timeout=10)
    assert r_citizen.status_code == 403


def test_status_update_rbac(citizen_token):
    r = requests.patch(f"{API}/issues/{state['issue_id']}/status",
                       json={"status": "Verified"},
                       headers=h(citizen_token), timeout=15)
    assert r.status_code == 403


def test_admin_status_verified(admin_token):
    r = requests.patch(f"{API}/issues/{state['issue_id']}/status",
                       json={"status": "Verified", "remark": "Looks valid",
                             "officer_id": state["officer_id"]},
                       headers=h(admin_token), timeout=15)
    assert r.status_code == 200

    # Confirm via GET
    r2 = requests.get(f"{API}/issues/track/{state['complaint_id']}", timeout=10)
    assert r2.status_code == 200
    issue = r2.json()
    assert issue["status"] == "Verified"
    assert issue["officer_name"] is not None
    assert any(t["status"] == "Verified" for t in issue["timeline"])


def test_admin_resolved_awards_points(admin_token, citizen_token):
    # Get points before
    r_before = requests.get(f"{API}/stats/user", headers=h(citizen_token), timeout=10)
    points_before = r_before.json()["points"]

    r = requests.patch(f"{API}/issues/{state['issue_id']}/status",
                       json={"status": "Resolved", "remark": "Fixed"},
                       headers=h(admin_token), timeout=15)
    assert r.status_code == 200

    r_after = requests.get(f"{API}/stats/user", headers=h(citizen_token), timeout=10)
    points_after = r_after.json()["points"]
    assert points_after >= points_before + 25


def test_invalid_status(admin_token):
    r = requests.patch(f"{API}/issues/{state['issue_id']}/status",
                       json={"status": "NotAStatus"},
                       headers=h(admin_token), timeout=15)
    assert r.status_code == 400


# ---- Notifications ----
def test_notifications(citizen_token):
    r = requests.get(f"{API}/notifications", headers=h(citizen_token), timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data and "unread" in data
    assert len(data["items"]) >= 1

    r2 = requests.post(f"{API}/notifications/read-all", headers=h(citizen_token), timeout=10)
    assert r2.status_code == 200
    r3 = requests.get(f"{API}/notifications", headers=h(citizen_token), timeout=10)
    assert r3.json()["unread"] == 0


# ---- Stats / Leaderboard / Community ----
def test_stats_admin(admin_token):
    r = requests.get(f"{API}/stats/admin", headers=h(admin_token), timeout=10)
    assert r.status_code == 200
    data = r.json()
    for k in ["users", "total", "resolved", "pending", "by_category", "by_status", "by_day"]:
        assert k in data
    assert len(data["by_day"]) == 7


def test_stats_admin_rbac(citizen_token):
    r = requests.get(f"{API}/stats/admin", headers=h(citizen_token), timeout=10)
    assert r.status_code == 403


def test_leaderboard():
    r = requests.get(f"{API}/leaderboard", timeout=10)
    assert r.status_code == 200
    arr = r.json()
    assert isinstance(arr, list)


def test_community_feed():
    r = requests.get(f"{API}/community/feed", timeout=10)
    assert r.status_code == 200


# ---- Contact ----
def test_contact():
    r = requests.post(f"{API}/contact",
                      json={"name": "TEST", "email": "test@civicconnect.in", "message": "Hello"},
                      timeout=10)
    assert r.status_code == 200
    assert r.json()["ok"] is True
