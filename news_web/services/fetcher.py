import time
import logging
import datetime
import requests
import feedparser
from typing import List, Dict, Any
from services.geocoder import geocoder

logger = logging.getLogger(__name__)

# Cache configuration
CACHE_TTL = 300  # 5 minutes
cached_disasters: List[Dict[str, Any]] = []
last_fetch_time: float = 0.0

def categorize_item(title: str, description: str = "") -> str:
    """Categorize event based on keywords."""
    text = (title + " " + description).lower()
    if any(w in text for w in ["earthquake", "quake", "แผ่นดินไหว", "อาฟเตอร์ช็อก", "seismic"]):
        return "earthquake"
    elif any(w in text for w in ["flood", "flooding", "น้ำท่วม", "น้ำป่า", "อุทกภัย", "เอ่อล้น"]):
        return "flood"
    elif any(w in text for w in ["storm", "cyclone", "typhoon", "hurricane", "พายุ", "วาตภัย", "ลมกระโชก", "ดีเปรสชัน"]):
        return "storm"
    elif any(w in text for w in ["wildfire", "fire", "bushfire", "ไฟป่า", "หมอกควัน"]):
        return "wildfire"
    elif any(w in text for w in ["volcano", "volcanic", "eruption", "ภูเขาไฟ"]):
        return "volcano"
    elif any(w in text for w in ["landslide", "mudslide", "ดินถล่ม", "โคลนถล่ม"]):
        return "landslide"
    elif any(w in text for w in ["tsunami", "สึนามิ"]):
        return "tsunami"
    return "general"

def determine_severity(category: str, title: str, description: str = "", raw_val: str = "") -> str:
    text = (title + " " + description + " " + raw_val).lower()
    if any(w in text for w in ["red", "critical", "severe", "วิกฤต", "รุนแรงมาก", "ฉุกเฉิน", "ดับชีวิต", "ถล่มหนัก"]):
        return "critical"
    if any(w in text for w in ["orange", "high", "warning", "เตือนภัย", "เสี่ยงสูง", "น้ำป่าหลาก"]):
        return "high"
    if any(w in text for w in ["yellow", "medium", "moderate", "ปานกลาง", "เฝ้าระวัง"]):
        return "medium"
    return "low"

def fetch_usgs_earthquakes() -> List[Dict[str, Any]]:
    """Fetch global earthquake data from USGS API."""
    items = []
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            features = data.get("features", [])
            for feat in features[:50]:
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})
                coords = geom.get("coordinates", [0, 0, 0])
                lng, lat = coords[0], coords[1]
                mag = props.get("mag", 0.0)
                place = props.get("place", "ไม่ระบุสถานที่")
                event_time = props.get("time", 0) / 1000.0  # seconds
                pub_date = datetime.datetime.fromtimestamp(event_time, datetime.timezone.utc).isoformat()
                
                # Severity
                if mag >= 6.0:
                    severity = "critical"
                elif mag >= 5.0:
                    severity = "high"
                elif mag >= 4.0:
                    severity = "medium"
                else:
                    severity = "low"

                # Region check (Thailand bounding box roughly: 5.0 to 21.0 N, 97.0 to 106.0 E)
                is_thai = 5.0 <= lat <= 21.0 and 97.0 <= lng <= 106.0
                region = "thailand" if is_thai else "international"

                title = f"แผ่นดินไหว ขนาด {mag:.1f} - {place}"

                items.append({
                    "id": f"usgs_{props.get('code', feat.get('id'))}",
                    "title": title,
                    "description": f"แผ่นดินไหวขนาด M{mag:.1f} ลึก {coords[2]} กม. บริเวณ {place}",
                    "category": "earthquake",
                    "region": region,
                    "latitude": lat,
                    "longitude": lng,
                    "location_name": place,
                    "severity": severity,
                    "magnitude": mag,
                    "pub_date": pub_date,
                    "source_name": "USGS Earthquakes",
                    "source_url": props.get("url", "https://earthquake.usgs.gov")
                })
    except Exception as e:
        logger.error(f"Error fetching USGS data: {e}")
    return items

def fetch_gdacs_alerts() -> List[Dict[str, Any]]:
    """Fetch global disaster alerts from GDACS RSS feed."""
    items = []
    url = "https://www.gdacs.org/xml/rss.xml"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            feed = feedparser.parse(res.text)
            for entry in feed.entries[:30]:
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                link = entry.get("link", "")

                # Extract lat/lng if present
                lat = None
                lng = None
                if "geo_lat" in entry and "geo_long" in entry:
                    try:
                        lat = float(entry["geo_lat"])
                        lng = float(entry["geo_long"])
                    except ValueError:
                        pass
                
                # If no lat/lng, geocode
                if lat is None or lng is None:
                    lat, lng, loc_name, reg = geocoder.extract_location_and_coords(title, summary)
                else:
                    loc_name = title
                    is_thai = 5.0 <= lat <= 21.0 and 97.0 <= lng <= 106.0
                    reg = "thailand" if is_thai else "international"

                cat = categorize_item(title, summary)
                sev = determine_severity(cat, title, summary)
                pub_date = entry.get("published", datetime.datetime.now(datetime.timezone.utc).isoformat())

                items.append({
                    "id": f"gdacs_{entry.get('id', hash(title))}",
                    "title": title,
                    "description": summary,
                    "category": cat,
                    "region": reg,
                    "latitude": lat,
                    "longitude": lng,
                    "location_name": loc_name,
                    "severity": sev,
                    "magnitude": None,
                    "pub_date": pub_date,
                    "source_name": "GDACS (Global Alerts)",
                    "source_url": link
                })
    except Exception as e:
        logger.error(f"Error fetching GDACS RSS: {e}")
    return items

def fetch_nasa_eonet() -> List[Dict[str, Any]]:
    """Fetch open natural event hazards from NASA EONET v3."""
    items = []
    url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=30"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            events = data.get("events", [])
            for ev in events:
                title = ev.get("title", "")
                categories = ev.get("categories", [])
                cat_title = categories[0].get("title", "") if categories else ""
                cat = categorize_item(title, cat_title)

                geometries = ev.get("geometry", [])
                if not geometries:
                    continue
                
                # Get latest geometry point
                geom = geometries[-1]
                coords = geom.get("coordinates", [])
                if len(coords) < 2:
                    continue

                lng, lat = coords[0], coords[1]
                event_date = geom.get("date", datetime.datetime.now(datetime.timezone.utc).isoformat())
                
                is_thai = 5.0 <= lat <= 21.0 and 97.0 <= lng <= 106.0
                reg = "thailand" if is_thai else "international"

                sources = ev.get("sources", [])
                source_url = sources[0].get("url", "https://eonet.gsfc.nasa.gov") if sources else "https://eonet.gsfc.nasa.gov"

                sev = "high" if cat in ["wildfire", "storm", "volcano"] else "medium"

                items.append({
                    "id": f"nasa_{ev.get('id')}",
                    "title": f"[EONET] {title}",
                    "description": f"เหตุการณ์ธรรมชาติหมวดหมู่: {cat_title} บันทึกเมื่อ {event_date}",
                    "category": cat,
                    "region": reg,
                    "latitude": lat,
                    "longitude": lng,
                    "location_name": title,
                    "severity": sev,
                    "magnitude": None,
                    "pub_date": event_date,
                    "source_name": "NASA EONET",
                    "source_url": source_url
                })
    except Exception as e:
        logger.error(f"Error fetching NASA EONET: {e}")
    return items

def fetch_thai_google_news() -> List[Dict[str, Any]]:
    """Fetch Thai disaster news via Google News RSS Feed."""
    items = []
    # Search query in Thai for disaster news
    query = "ภัยพิบัติ OR น้ำท่วม OR ดินถล่ม OR แผ่นดินไหว OR ไฟป่า OR วาตภัย"
    url = f"https://news.google.com/rss/search?q={query}&hl=th&gl=TH&ceid=TH:th"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            feed = feedparser.parse(res.text)
            for entry in feed.entries[:25]:
                title = entry.get("title", "")
                link = entry.get("link", "")
                summary = entry.get("summary", entry.get("description", ""))
                pub_date = entry.get("published", datetime.datetime.now(datetime.timezone.utc).isoformat())

                # Extract location and coordinates
                lat, lng, loc_name, reg = geocoder.extract_location_and_coords(title, summary)
                cat = categorize_item(title, summary)
                sev = determine_severity(cat, title, summary)

                # Source title cleanup
                source_name = "ข่าวภัยพิบัติไทย"
                if " - " in title:
                    parts = title.rsplit(" - ", 1)
                    title_clean = parts[0]
                    source_name = parts[1]
                else:
                    title_clean = title

                items.append({
                    "id": f"th_news_{hash(title)}",
                    "title": title_clean,
                    "description": summary,
                    "category": cat,
                    "region": reg,
                    "latitude": lat,
                    "longitude": lng,
                    "location_name": loc_name,
                    "severity": sev,
                    "magnitude": None,
                    "pub_date": pub_date,
                    "source_name": source_name,
                    "source_url": link
                })
    except Exception as e:
        logger.error(f"Error fetching Thai news RSS: {e}")
    return items

def get_all_disasters(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """Get aggregated disasters with caching."""
    global cached_disasters, last_fetch_time
    now = time.time()
    
    if not force_refresh and cached_disasters and (now - last_fetch_time < CACHE_TTL):
        return cached_disasters

    logger.info("Fetching fresh disaster data from all sources...")
    all_data = []

    # Fetch from multiple sources
    usgs_items = fetch_usgs_earthquakes()
    gdacs_items = fetch_gdacs_alerts()
    nasa_items = fetch_nasa_eonet()
    thai_items = fetch_thai_google_news()

    all_data.extend(usgs_items)
    all_data.extend(gdacs_items)
    all_data.extend(nasa_items)
    all_data.extend(thai_items)

    # Deduplicate by title similarity or ID
    seen_ids = set()
    unique_items = []
    for item in all_data:
        if item["id"] not in seen_ids:
            seen_ids.add(item["id"])
            unique_items.append(item)

    # Sort by pub_date descending if possible
    try:
        unique_items.sort(key=lambda x: str(x.get("pub_date", "")), reverse=True)
    except Exception:
        pass

    cached_disasters = unique_items
    last_fetch_time = now
    logger.info(f"Successfully aggregated {len(cached_disasters)} disaster records.")
    return cached_disasters
