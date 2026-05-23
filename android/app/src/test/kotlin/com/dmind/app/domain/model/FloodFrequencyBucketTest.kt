package com.dmind.app.domain.model

import org.junit.Assert.assertEquals
import org.junit.Test

class FloodFrequencyBucketTest {
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
