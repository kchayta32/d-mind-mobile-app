package com.dmind.app.network.api

import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaTimeRange
import org.junit.Assert.assertEquals
import org.junit.Test

class GistdaEndpointPathsTest {
    @Test
    fun `viirs feature and wmts paths handle three day naming difference`() {
        assertEquals(
            "resources/features/viirs/3days",
            GistdaEndpointPaths.viirsFeaturePath(GistdaTimeRange.ThreeDays),
        )
        assertEquals(
            "resources/maps/viirs/3day/wmts",
            GistdaEndpointPaths.viirsWmtsPath(GistdaTimeRange.ThreeDays),
        )
        assertEquals(
            "resources/maps/viirs/7day/wms",
            GistdaEndpointPaths.viirsWmsPath(GistdaTimeRange.SevenDays),
        )
        assertEquals(
            "resources/maps/viirs/30day/wms",
            GistdaEndpointPaths.viirsWmsPath(GistdaTimeRange.ThirtyDays),
        )
    }

    @Test
    fun `flood maps use GISTDA singular day map path naming`() {
        assertEquals(
            "resources/maps/flood/3day/wms",
            GistdaEndpointPaths.floodWmsPath(GistdaTimeRange.ThreeDays),
        )
        assertEquals(
            "resources/maps/flood/7day/wmts",
            GistdaEndpointPaths.floodWmtsPath(GistdaTimeRange.SevenDays),
        )
        assertEquals(
            "resources/maps/flood/30day/wms",
            GistdaEndpointPaths.floodWmsPath(GistdaTimeRange.ThirtyDays),
        )
    }

    @Test
    fun `flood frequency uses dedicated map path`() {
        assertEquals(
            "resources/features/flood-freq",
            GistdaEndpointPaths.floodFeaturePath(GistdaTimeRange.FloodFrequency),
        )
        assertEquals(
            "resources/maps/flood-freq/wmts",
            GistdaEndpointPaths.wmtsPath(DisasterLayerType.Flood, GistdaTimeRange.FloodFrequency),
        )
        assertEquals(
            "resources/maps/flood-freq/wms",
            GistdaEndpointPaths.floodWmsPath(GistdaTimeRange.FloodFrequency),
        )
    }

    @Test
    fun `drought 7 day map paths are available for smap ndwi and dri plus`() {
        assertEquals(
            "resources/maps/smap/7days/wmts",
            GistdaEndpointPaths.droughtMapPath(GistdaDroughtProduct.Smap),
        )
        assertEquals(
            "resources/maps/ndwi/7days/tms",
            GistdaEndpointPaths.droughtMapPath(GistdaDroughtProduct.Ndwi),
        )
        assertEquals(
            "resources/maps/dri/7days/tms",
            GistdaEndpointPaths.droughtMapPath(GistdaDroughtProduct.DriPlus),
        )
        assertEquals(
            "resources/maps/smap/7days/wms",
            GistdaEndpointPaths.droughtWmsPath(GistdaDroughtProduct.Smap),
        )
        assertEquals(
            "xyz",
            GistdaEndpointPaths.tileScheme(DisasterLayerType.DroughtSmap, GistdaDroughtProduct.Smap),
        )
        assertEquals(
            "xyz",
            GistdaEndpointPaths.tileScheme(DisasterLayerType.DroughtSmap, GistdaDroughtProduct.Ndwi),
        )
    }
}
