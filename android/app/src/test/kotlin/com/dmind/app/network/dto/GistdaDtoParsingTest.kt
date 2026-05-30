package com.dmind.app.network.dto

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

// คลาสทดสอบความถูกต้องในการแปลงและวิเคราะห์ข้อมูล JSON (Data Transfer Object) จาก GISTDA API
class GistdaDtoParsingTest {
    
    // ทดสอบความสามารถในการทดแทนฟิลด์ที่ขาดหายด้วยเครื่องหมาย "-" สำหรับข้อมูลตำแหน่งจุดความร้อน VIIRS
    @Test
    fun `viirs dto uses dash fallbacks for missing location fields`() {
        val response = GistdaFeatureResponseDto.fromJson(
            """
            {
              "features": [
                {
                  "id": "hotspot-1",
                  "geometry": { "type": "Point", "coordinates": [100.5018, 13.7563] },
                  "properties": {
                    "ct_tn": "ราชอาณาจักรไทย",
                    "th_date": "8 พฤษภาคม 2569",
                    "utm_zone": 47,
                    "v_dist": 1.789
                  }
                }
              ]
            }
            """.trimIndent(),
        )

        val dto = GistdaViirsFeatureDto.fromFeature(response.features.first(), 0)

        assertNotNull(dto)
        dto!!
        assertEquals("ราชอาณาจักรไทย", dto.country)
        assertEquals("-", dto.province)
        assertEquals("-", dto.district)
        assertEquals("-", dto.subdistrict)
        assertEquals("47", dto.utmZone)
        assertEquals("1.789", dto.vDist)
    }

    // ทดสอบการคำนวณพิกัดจุดศูนย์กลางของโพลีกอน (Centroid) และดึงคุณสมบัติน้ำท่วมอื่นๆ จาก JSON ได้อย่างปลอดภัย
    @Test
    fun `flood dto calculates polygon centroid safely`() {
        val response = GistdaFeatureResponseDto.fromJson(
            """
            {
              "features": [
                {
                  "id": "flood-1",
                  "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[100.0, 14.0], [101.0, 14.0], [101.0, 15.0], [100.0, 15.0]]]
                  },
                  "properties": { "pv_tn": "อยุธยา", "f_area": 120000, "freq": 9 }
                }
              ]
            }
            """.trimIndent(),
        )

        val dto = GistdaFloodFeatureDto.fromFeature(response.features.first(), 0)

        assertNotNull(dto)
        dto!!
        assertEquals("อยุธยา", dto.province)
        assertEquals(14.5, dto.latitude, 0.001)
        assertEquals(100.5, dto.longitude, 0.001)
        assertEquals(120000.0, dto.areaSquareMeters ?: 0.0, 0.001)
        assertEquals(9, dto.recurrenceCount)
    }
}
