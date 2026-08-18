import os
import uvicorn
from typing import Optional
from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from services.fetcher import get_all_disasters

app = FastAPI(
    title="Disaster & Natural Hazard News Center",
    description="Real-time disaster tracking and news aggregation for Thailand and Worldwide with Map UI",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory setup
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
async def startup_event():
    """Prefetch data on application startup."""
    get_all_disasters(force_refresh=True)

@app.get("/")
async def root():
    """Serve main Dashboard UI."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Disaster News API is running. Add static/index.html to view dashboard UI."}

@app.get("/api/disasters")
async def get_disasters(
    region: Optional[str] = Query("all", description="Region filter: 'all', 'thailand', 'international'"),
    category: Optional[str] = Query("all", description="Category filter: 'all', 'earthquake', 'flood', 'storm', 'wildfire', 'volcano', 'landslide', 'tsunami', 'general'"),
    severity: Optional[str] = Query("all", description="Severity filter: 'all', 'critical', 'high', 'medium', 'low'"),
    search: Optional[str] = Query(None, description="Search keyword in title, location, or description"),
    force_refresh: bool = Query(False, description="Bypass cache and force fetch fresh data")
):
    """Fetch aggregated disaster news with filtering."""
    disasters = get_all_disasters(force_refresh=force_refresh)

    filtered = disasters

    # Region filter
    if region and region.lower() != "all":
        filtered = [d for d in filtered if d.get("region", "").lower() == region.lower()]

    # Category filter
    if category and category.lower() != "all":
        filtered = [d for d in filtered if d.get("category", "").lower() == category.lower()]

    # Severity filter
    if severity and severity.lower() != "all":
        filtered = [d for d in filtered if d.get("severity", "").lower() == severity.lower()]

    # Search filter
    if search:
        s = search.lower()
        filtered = [
            d for d in filtered
            if s in d.get("title", "").lower()
            or s in d.get("description", "").lower()
            or s in d.get("location_name", "").lower()
            or s in d.get("source_name", "").lower()
        ]

    return {
        "status": "success",
        "total_count": len(filtered),
        "data": filtered
    }

@app.get("/api/stats")
async def get_stats():
    """Get aggregated statistics for disaster dashboard."""
    disasters = get_all_disasters()

    thailand_count = sum(1 for d in disasters if d.get("region") == "thailand")
    intl_count = sum(1 for d in disasters if d.get("region") == "international")

    categories = {}
    severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}

    for d in disasters:
        cat = d.get("category", "general")
        categories[cat] = categories.get(cat, 0) + 1

        sev = d.get("severity", "low")
        if sev in severities:
            severities[sev] += 1
        else:
            severities[sev] = 1

    return {
        "status": "success",
        "total_events": len(disasters),
        "thailand_events": thailand_count,
        "international_events": intl_count,
        "severities": severities,
        "categories": categories
    }

@app.post("/api/refresh")
async def refresh_disasters():
    """Force refresh data cache."""
    disasters = get_all_disasters(force_refresh=True)
    return {
        "status": "success",
        "message": "Data cache refreshed successfully",
        "total_events": len(disasters)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
