package com.dmind.app.ui.screens.map

import org.junit.Assert.assertEquals
import org.junit.Test

// คลาสทดสอบการทำงานของฟังก์ชันสำหรับจัดรูปแบบข้อมูลที่นำไปแสดงผลบน Bottom Sheet ของแผนที่
class MapBottomSheetHelperTest {
    
    // ทดสอบฟังก์ชันในการแยกแยะและสกัดข้อมูลขนาด (Magnitude) และความลึก (Depth) ของการเกิดแผ่นดินไหวจากข้อมูลดิบ
    @Test
    fun testParseEarthquakeMetric() {
        // Test case 1: Standard metric format
        val metric1 = "4.5 Mw • 10.0 กม."
        val title1 = "แผ่นดินไหว 4.5 Mw"
        val (magnitude1, depth1) = parseEarthquakeMetric(metric1, title1)
        assertEquals("4.5", magnitude1)
        assertEquals("10.0", depth1)

        // Test case 2: Metric without depth
        val metric2 = "5.2 Mw"
        val title2 = "แผ่นดินไหว 5.2 Mw"
        val (magnitude2, depth2) = parseEarthquakeMetric(metric2, title2)
        assertEquals("5.2", magnitude2)
        assertEquals("-", depth2)

        // Test case 3: Metric format with different spaces
        val metric3 = "  3.8 Mw  •  5.5 กม.  "
        val title3 = "แผ่นดินไหว 3.8 Mw"
        val (magnitude3, depth3) = parseEarthquakeMetric(metric3, title3)
        assertEquals("3.8", magnitude3)
        assertEquals("5.5", depth3)

        // Test case 4: Fallback to title when metric magnitude is empty
        val metric4 = " • 15.0 กม."
        val title4 = "แผ่นดินไหว 4.1 Mw"
        val (magnitude4, depth4) = parseEarthquakeMetric(metric4, title4)
        assertEquals("4.1", magnitude4)
        assertEquals("15.0", depth4)
    }

    // ทดสอบฟังก์ชันในการสกัดและแปลงค่าความหนาแน่นฝุ่น PM2.5 จากรูปแบบหน่วยข้อความต่างๆ ให้เป็นตัวเลข Double
    @Test
    fun testParsePmValue() {
        // Test case 1: Standard ug/m3 metric
        assertEquals(24.5, parsePmValue("24.5 ug/m3"), 0.001)

        // Test case 2: Metric with unicode µg/m³
        assertEquals(8.2, parsePmValue("8.2 µg/m³"), 0.001)

        // Test case 3: Clean numeric string
        assertEquals(45.0, parsePmValue("45.0"), 0.001)

        // Test case 4: Invalid format fallback
        assertEquals(0.0, parsePmValue("invalid"), 0.001)
    }
}
