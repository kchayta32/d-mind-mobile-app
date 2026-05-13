package com.dmind.app.util;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.dmind.app.model.GeoPoint;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

public class GeofenceUtilsTest {

    @Test
    public void pointInPolygon_detectsInsideAndOutsidePoints() {
        List<GeoPoint> square = Arrays.asList(
            new GeoPoint(13.0, 100.0),
            new GeoPoint(13.0, 101.0),
            new GeoPoint(14.0, 101.0),
            new GeoPoint(14.0, 100.0)
        );

        assertTrue(GeofenceUtils.isPointInPolygon(new GeoPoint(13.5, 100.5), square));
        assertFalse(GeofenceUtils.isPointInPolygon(new GeoPoint(12.5, 100.5), square));
    }

    @Test
    public void distanceCalculation_isNonZeroForDifferentPoints() {
        double distance = GeofenceUtils.calculateDistance(
            new GeoPoint(13.7563, 100.5018),
            new GeoPoint(13.7466, 100.5347)
        );

        assertTrue(distance > 3000);
    }
}
