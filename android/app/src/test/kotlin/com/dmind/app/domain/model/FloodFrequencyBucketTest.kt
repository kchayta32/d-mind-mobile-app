package com.dmind.app.domain.model

import org.junit.Assert.assertEquals
import org.junit.Test

// คลาสทดสอบการทำงานของการจำแนกช่วงกลุ่มระดับความถี่ของการเกิดน้ำท่วม (Flood Frequency Bucket)
class FloodFrequencyBucketTest {
    
    // ทดสอบฟังก์ชันคัดกรองและแบ่งระดับกลุ่มความถี่ของน้ำท่วมตามจำนวนครั้งที่เกิดจริง (รวมถึงกรณีค่าเป็น null)
    @Test
    fun `classifies flood frequency buckets`() {
        assertEquals(FloodFrequencyBucket.LessThanOne, floodFrequencyBucket(0))
        assertEquals(FloodFrequencyBucket.OneToThree, floodFrequencyBucket(1))
        assertEquals(FloodFrequencyBucket.OneToThree, floodFrequencyBucket(3))
        assertEquals(FloodFrequencyBucket.ThreeToSix, floodFrequencyBucket(6))
        assertEquals(FloodFrequencyBucket.SixToNine, floodFrequencyBucket(9))
        assertEquals(FloodFrequencyBucket.NineToTwelve, floodFrequencyBucket(12))
        assertEquals(FloodFrequencyBucket.MoreThanTwelve, floodFrequencyBucket(13))
        assertEquals(FloodFrequencyBucket.LessThanOne, floodFrequencyBucket(null))
    }
}
