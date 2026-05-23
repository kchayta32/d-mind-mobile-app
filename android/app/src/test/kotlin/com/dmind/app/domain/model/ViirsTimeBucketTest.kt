package com.dmind.app.domain.model

import org.junit.Assert.assertEquals
import org.junit.Test

class ViirsTimeBucketTest {
    @Test
    fun `classifies viirs time buckets`() {
        assertEquals(ViirsTimeBucket.LessThanOne, viirsTimeBucket(0.4))
        assertEquals(ViirsTimeBucket.OneToThree, viirsTimeBucket(1.5))
        assertEquals(ViirsTimeBucket.ThreeToSix, viirsTimeBucket(3.0))
        assertEquals(ViirsTimeBucket.SixToTwelve, viirsTimeBucket(7.0))
        assertEquals(ViirsTimeBucket.TwelveToTwentyFour, viirsTimeBucket(18.0))
        assertEquals(ViirsTimeBucket.MoreThanTwentyFour, viirsTimeBucket(26.0))
        assertEquals(ViirsTimeBucket.MoreThanTwentyFour, viirsTimeBucket(null))
    }
}
