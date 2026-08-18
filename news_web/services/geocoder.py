import json
import os
import re
import logging
from typing import Tuple, Optional, Dict
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

logger = logging.getLogger(__name__)

CACHE_FILE = os.path.join(os.path.dirname(__file__), "geocache.json")

# Pre-defined high-accuracy coordinates for Thai provinces & major locations
THAI_LOCATIONS: Dict[str, Tuple[float, float]] = {
    "กรุงเทพมหานคร": (13.7563, 100.5018),
    "กรุงเทพ": (13.7563, 100.5018),
    "เชียงใหม่": (18.7883, 98.9853),
    "เชียงราย": (19.9105, 99.8406),
    "แม่ฮ่องสอน": (19.3020, 97.9654),
    "น่าน": (18.7838, 100.7781),
    "พะเยา": (19.1658, 99.9022),
    "ลำปาง": (18.2888, 99.4923),
    "ลำพูน": (18.5744, 99.0087),
    "แพร่": (18.1446, 100.1403),
    "อุตรดิตถ์": (17.6201, 100.0956),
    "พิษณุโลก": (16.8211, 100.2659),
    "สุโขทัย": (17.0077, 99.8230),
    "ตาก": (16.8839, 99.1258),
    "กำแพงเพชร": (16.4828, 99.5227),
    "พิจิตร": (16.4420, 100.3482),
    "เพชรบูรณ์": (16.4190, 101.1561),
    "นครสวรรค์": (15.6987, 100.1199),
    "อุทัยธานี": (15.3833, 100.0247),
    "นนทบุรี": (13.8591, 100.5217),
    "ปทุมธานี": (14.0208, 100.5250),
    "สมุทรปราการ": (13.5991, 100.5968),
    "สมุทรสาคร": (13.5475, 100.2744),
    "สมุทรสงคราม": (13.4098, 100.0023),
    "นครปฐม": (13.8196, 100.0442),
    "สุพรรณบุรี": (14.4745, 100.1177),
    "อยุธยา": (14.3532, 100.5684),
    "พระนครศรีอยุธยา": (14.3532, 100.5684),
    "อ่างทอง": (14.5896, 100.4550),
    "ลพบุรี": (14.7995, 100.6534),
    "สิงห์บุรี": (14.8888, 100.3967),
    "ชัยนาท": (15.1852, 100.1251),
    "สระบุรี": (14.5289, 100.9108),
    "นครราชสีมา": (14.9799, 102.0978),
    "โคราช": (14.9799, 102.0978),
    "ขอนแก่น": (16.4322, 102.8236),
    "อุดรธานี": (17.4138, 102.7872),
    "อุบลราชธานี": (15.2287, 104.8594),
    "ชัยภูมิ": (15.8068, 102.0315),
    "บุรีรัมย์": (14.9930, 103.1029),
    "สุรินทร์": (14.8818, 103.4936),
    "ศรีสะเกษ": (15.1186, 104.3220),
    "มหาสารคาม": (16.1852, 103.3007),
    "ร้อยเอ็ด": (16.0538, 103.6520),
    "เลย": (17.4860, 101.7223),
    "หนองคาย": (17.8783, 102.7421),
    "หนองบัวลำภู": (17.2040, 102.4404),
    "สกลนคร": (17.1681, 104.1486),
    "นครพนม": (17.3920, 104.7696),
    "มุกดาหาร": (16.5453, 104.7238),
    "ยโสธร": (15.7924, 104.1453),
    "อำนาจเจริญ": (15.8647, 104.6258),
    "บึงกาฬ": (18.3614, 103.6464),
    "ชลบุรี": (13.3611, 100.9847),
    "พัทยา": (12.9236, 100.8825),
    "ระยอง": (12.6814, 101.2816),
    "จันทบุรี": (12.6114, 102.1039),
    "ตราด": (12.2428, 102.5175),
    "ฉะเชิงเทรา": (13.6904, 101.0780),
    "ปราจีนบุรี": (14.0509, 101.3717),
    "นครนายก": (14.2069, 101.2130),
    "สระแก้ว": (13.8140, 102.0716),
    "กาญจนบุรี": (14.0227, 99.5328),
    "ราชบุรี": (13.5373, 99.8164),
    "เพชรบุรี": (13.1132, 99.9392),
    "ประจวบคีรีขันธ์": (11.8124, 99.7973),
    "หัวหิน": (12.5684, 99.9577),
    "สุราษฎร์ธานี": (9.1382, 99.3217),
    "เกาะสมุย": (9.5120, 100.0136),
    "นครศรีธรรมราช": (8.4304, 99.9631),
    "ภูเก็ต": (7.8804, 98.3923),
    "กระบี่": (8.0863, 98.9063),
    "พังงา": (8.4501, 98.5255),
    "ระนอง": (9.9658, 98.6348),
    "ชุมพร": (10.4930, 99.1800),
    "ตรัง": (7.5563, 99.6114),
    "พัทลุง": (7.6167, 100.0740),
    "สตูล": (6.6238, 100.0674),
    "สงขลา": (7.1988, 100.5954),
    "หาดใหญ่": (7.0084, 100.4767),
    "ปัตตานี": (6.8667, 101.2500),
    "ยะลา": (6.5411, 101.2804),
    "เบตง": (5.7743, 101.0713),
    "นราธิวาส": (6.4255, 101.8253),
}

# Pre-defined international major locations
WORLD_LOCATIONS: Dict[str, Tuple[float, float]] = {
    "ญี่ปุ่น": (36.2048, 138.2529),
    "japan": (36.2048, 138.2529),
    "tokyo": (35.6762, 139.6503),
    "โตเกียว": (35.6762, 139.6503),
    "อินโดนีเซีย": (-0.7893, 113.9213),
    "indonesia": (-0.7893, 113.9213),
    "บาหลี": (-8.4095, 115.1889),
    "จาการ์ตา": (-6.2088, 106.8456),
    "ฟิลิปปินส์": (12.8797, 121.7740),
    "philippines": (12.8797, 121.7740),
    "มะนิลา": (14.5995, 120.9842),
    "ไต้หวัน": (23.6978, 120.9605),
    "taiwan": (23.6978, 120.9605),
    "เวียดนาม": (14.0583, 108.2772),
    "vietnam": (14.0583, 108.2772),
    "ฮานอย": (21.0285, 105.8542),
    "พม่า": (21.9162, 95.9560),
    "เมียนมา": (21.9162, 95.9560),
    "myanmar": (21.9162, 95.9560),
    "ลาว": (19.8563, 102.4955),
    "laos": (19.8563, 102.4955),
    "เวียงจันทน์": (17.9757, 102.6331),
    "กัมพูชา": (12.5657, 104.9910),
    "cambodia": (12.5657, 104.9910),
    "จีน": (35.8617, 104.1954),
    "china": (35.8617, 104.1954),
    "อินเดีย": (20.5937, 78.9629),
    "india": (20.5937, 78.9629),
    "ตุรกี": (38.9637, 35.2433),
    "turkey": (38.9637, 35.2433),
    "turkiye": (38.9637, 35.2433),
    "สหรัฐ": (37.0902, -95.7129),
    "สหรัฐอเมริกา": (37.0902, -95.7129),
    "usa": (37.0902, -95.7129),
    "แคลิฟอร์เนีย": (36.7783, -119.4179),
    "california": (36.7783, -119.4179),
    "ฮาวาย": (19.8968, -155.5828),
    "hawaii": (19.8968, -155.5828),
    "ไอซ์แลนด์": (64.9631, -19.0208),
    "iceland": (64.9631, -19.0208),
    "นิวซีแลนด์": (-40.9006, 174.8860),
    "new zealand": (-40.9006, 174.8860),
    "ออสเตรเลีย": (-25.2744, 133.7751),
    "australia": (-25.2744, 133.7751),
    "เนปาล": (28.3949, 84.1240),
    "nepal": (28.3949, 84.1240),
    "ปากีสถาน": (30.3753, 69.3451),
    "pakistan": (30.3753, 69.3451),
}


class DisasterGeocoder:
    def __init__(self):
        self.cache: Dict[str, Tuple[float, float]] = {}
        self.geolocator = Nominatim(user_agent="disaster_news_web_app_v1")
        self._load_cache()

    def _load_cache(self):
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.cache = {k: (v[0], v[1]) for k, v in data.items()}
            except Exception as e:
                logger.warning(f"Failed to load geocache: {e}")

    def _save_cache(self):
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.warning(f"Failed to save geocache: {e}")

    def extract_location_and_coords(self, title: str, description: str = "") -> Tuple[Optional[float], Optional[float], str, str]:
        """
        Extract coordinates, location name, and region (thailand/international) from title/description text.
        Returns: (latitude, longitude, location_name, region)
        """
        full_text = f"{title} {description}"

        # 1. Check Thai locations dictionary
        for name, coords in THAI_LOCATIONS.items():
            if name in full_text:
                return coords[0], coords[1], f"{name}, ประเทศไทย", "thailand"

        # 2. Check World locations dictionary
        for name, coords in WORLD_LOCATIONS.items():
            if name.lower() in full_text.lower():
                return coords[0], coords[1], name, "international"

        # 3. Check Regex patterns for coordinates in text (e.g. 13.75, 100.50 or Lat: 13.7, Lng: 100.5)
        coord_match = re.search(r'(?:lat|latitude|พิกัด)?\s*[:=]?\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)', full_text, re.IGNORECASE)
        if coord_match:
            try:
                lat = float(coord_match.group(1))
                lng = float(coord_match.group(2))
                is_th = 5.0 <= lat <= 21.0 and 97.0 <= lng <= 106.0
                reg = "thailand" if is_th else "international"
                return lat, lng, "พิกัดที่พบในข่าว", reg
            except ValueError:
                pass

        # Default fallback to Bangkok center if Thai disaster keywords are present
        thai_keywords = ["ไทย", "บาท", "ปภ.", "กรมอุตุนิยมวิทยา", "ทั่วไทย", "ภาคเหนือ", "ภาคใต้", "ภาคอีสาน", "ภาคกลาง"]
        if any(k in full_text for k in thai_keywords):
            return 13.7563, 100.5018, "ประเทศไทย (โดยรวม)", "thailand"

        # Global fallback (Equator/Global overview)
        return 20.0, 100.0, "ไม่ระบุพื้นที่แน่ชัด", "international"

geocoder = DisasterGeocoder()
