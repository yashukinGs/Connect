export function Logo({ size = 28, showText = true }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="cc-logo">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ccg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6"/>
            <stop offset="1" stopColor="#1D4ED8"/>
          </linearGradient>
        </defs>
        {/* Pin + Shield */}
        <path d="M24 3C15.16 3 8 10.16 8 19c0 11.5 14.5 24.5 15.1 25.05a1.3 1.3 0 0 0 1.8 0C25.5 43.5 40 30.5 40 19 40 10.16 32.84 3 24 3Z"
              fill="url(#ccg)"/>
        {/* Shield inside */}
        <path d="M24 10l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3Z" fill="#0B1220" stroke="#93C5FD" strokeWidth="1.2"/>
        {/* City silhouette inside shield */}
        <path d="M17 22h2v5h-2v-5Zm3 -2h2v7h-2v-7Zm3 3h2v4h-2v-4Zm3 -3h2v7h-2v-7Zm3 2h2v5h-2v-5Z" fill="#93C5FD"/>
      </svg>
      {showText && (
        <div className="leading-none">
          <div className="text-[15px] font-bold tracking-tight" style={{ fontFamily: "Outfit" }}>
            Civic<span className="text-blue-400">Connect</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted mt-0.5">Smart Citizen Platform</div>
        </div>
      )}
    </div>
  );
}
