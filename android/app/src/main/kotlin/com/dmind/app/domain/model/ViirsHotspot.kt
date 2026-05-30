package com.dmind.app.domain.model

// กลุ่มช่วงเวลาที่วัดได้นับตั้งแต่วิเคราะห์จุดความร้อนสำเร็จ เพื่อตรวจสอบความเสี่ยงไฟป่า
enum class ViirsTimeBucket(
    val label: String, // ฉลากป้ายกำกับช่วงระยะเวลาเป็นชั่วโมง
    val minHours: Double, // เวลาขั้นต่ำในหน่วยชั่วโมง
) {
    LessThanOne("<1", 0.0),
    OneToThree("1–3", 1.0),
    ThreeToSix("3–6", 3.0),
    SixToTwelve("6–12", 6.0),
    TwelveToTwentyFour("12–24", 12.0),
    MoreThanTwentyFour(">24", 24.0),
}

// ฟังก์ชันระบุและค้นหากลุ่มช่วงเวลาของการเกิดจุดความร้อนตามจำนวนชั่วโมง
fun viirsTimeBucket(hoursSinceDetected: Double?): ViirsTimeBucket {
    val hours = hoursSinceDetected ?: return ViirsTimeBucket.MoreThanTwentyFour
    return when {
        hours < 1.0 -> ViirsTimeBucket.LessThanOne
        hours < 3.0 -> ViirsTimeBucket.OneToThree
        hours < 6.0 -> ViirsTimeBucket.ThreeToSix
        hours < 12.0 -> ViirsTimeBucket.SixToTwelve
        hours < 24.0 -> ViirsTimeBucket.TwelveToTwentyFour
        else -> ViirsTimeBucket.MoreThanTwentyFour
    }
}

// ข้อมูลพิกัดจุดความร้อน (Hotspot) จากการสังเกตการณ์ผ่านระบบดาวเทียม VIIRS
data class ViirsHotspot(
    val id: String, // รหัสประจำพิกัดจุดตรวจพบ
    val latitude: Double, // ค่าละติจูดของจุดความร้อน
    val longitude: Double, // ค่าลองจิจูดของจุดความร้อน
    val country: String, // ชื่อประเทศ
    val province: String, // ชื่อจังหวัด
    val district: String, // ชื่ออำเภอ
    val subdistrict: String, // ชื่อตำบล
    val detectedDate: String, // วันเวลาเริ่มต้นการตรวจพบภัย
    val utmZone: String, // โซนแผนที่อ้างอิงระบบ UTM
    val responsibleArea: String, // พื้นที่หน่วยรับผิดชอบทางกฎหมาย (เช่น เขตอุทยาน หรือ เกษตรกรรม)
    val vAngle: String, // มุมและทิศทางตรวจจับ
    val vDirect: String, // ทิศทางสัมพัทธ์ของจุดความร้อน
    val vDist: String, // ระยะห่างจากจุดประเมินพิกัด
    val hoursSinceDetected: Double?, // เวลาล่วงเลยหลังจากการตรวจจับสำเร็จ (ชั่วโมง)
) {
    // การวิเคราะห์และคืนกลุ่มช่วงเวลา (Time Bucket) สำหรับจุดความร้อนนี้
    val timeBucket: ViirsTimeBucket
        get() = viirsTimeBucket(hoursSinceDetected)

    // ลิงก์สำหรับเปิดดูพิกัดจุดความร้อนโดยตรงบนแผนที่ Google Maps
    val googleMapsUrl: String
        get() = "https://www.google.com/maps/search/?api=1&query=$latitude,$longitude"
}
