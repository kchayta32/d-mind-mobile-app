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

    @Test
    public void normalizePolygon_closesAndNormalizesWindingOrder() {
        // Create an open polygon with CW winding order: A -> B -> C (which closes to CW: A -> B -> C -> A)
        List<GeoPoint> polygon = new java.util.ArrayList<>(Arrays.asList(
            new GeoPoint(13.0, 100.0), // A
            new GeoPoint(14.0, 100.0), // B
            new GeoPoint(14.0, 101.0)  // C
        ));

        GeofenceUtils.normalizePolygon(polygon);

        // It should be closed and reversed to CCW: A -> C -> B -> A
        assertTrue(GeofenceUtils.isPolygonClosed(polygon));
        org.junit.Assert.assertEquals(4, polygon.size());
        
        // First point should be A
        org.junit.Assert.assertEquals(13.0, polygon.get(0).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(100.0, polygon.get(0).getLongitude(), 0.000001);
        
        // Second point should be C (since it was reversed from B)
        org.junit.Assert.assertEquals(14.0, polygon.get(1).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(101.0, polygon.get(1).getLongitude(), 0.000001);
        
        // Third point should be B (since it was reversed from C)
        org.junit.Assert.assertEquals(14.0, polygon.get(2).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(100.0, polygon.get(2).getLongitude(), 0.000001);
        
        // Fourth point should be A
        org.junit.Assert.assertEquals(13.0, polygon.get(3).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(100.0, polygon.get(3).getLongitude(), 0.000001);
    }

    @Test
    public void normalizePolygon_alreadyCCW_onlyCloses() {
        List<GeoPoint> polygon = new java.util.ArrayList<>(Arrays.asList(
            new GeoPoint(13.0, 100.0), // A
            new GeoPoint(14.0, 101.0), // C
            new GeoPoint(14.0, 100.0)  // B
        ));

        GeofenceUtils.normalizePolygon(polygon);

        assertTrue(GeofenceUtils.isPolygonClosed(polygon));
        org.junit.Assert.assertEquals(4, polygon.size());
        
        // Order should remain A -> C -> B -> A
        org.junit.Assert.assertEquals(13.0, polygon.get(0).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(14.0, polygon.get(1).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(14.0, polygon.get(2).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(13.0, polygon.get(3).getLatitude(), 0.000001);
    }

    @Test
    public void normalizePolygon_alreadyClosedAndCCW_doesNothing() {
        List<GeoPoint> polygon = new java.util.ArrayList<>(Arrays.asList(
            new GeoPoint(13.0, 100.0),
            new GeoPoint(14.0, 101.0),
            new GeoPoint(14.0, 100.0),
            new GeoPoint(13.0, 100.0)
        ));

        GeofenceUtils.normalizePolygon(polygon);

        assertTrue(GeofenceUtils.isPolygonClosed(polygon));
        org.junit.Assert.assertEquals(4, polygon.size());
        
        org.junit.Assert.assertEquals(13.0, polygon.get(0).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(14.0, polygon.get(1).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(14.0, polygon.get(2).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(13.0, polygon.get(3).getLatitude(), 0.000001);
    }

    @Test
    public void normalizePolygon_alreadyClosedAndCW_reversesWinding() {
        List<GeoPoint> polygon = new java.util.ArrayList<>(Arrays.asList(
            new GeoPoint(13.0, 100.0),
            new GeoPoint(14.0, 100.0),
            new GeoPoint(14.0, 101.0),
            new GeoPoint(13.0, 100.0)
        ));

        GeofenceUtils.normalizePolygon(polygon);

        assertTrue(GeofenceUtils.isPolygonClosed(polygon));
        org.junit.Assert.assertEquals(4, polygon.size());
        
        org.junit.Assert.assertEquals(13.0, polygon.get(0).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(14.0, polygon.get(1).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(14.0, polygon.get(2).getLatitude(), 0.000001);
        org.junit.Assert.assertEquals(13.0, polygon.get(3).getLatitude(), 0.000001);
    }

    @Test
    public void normalizePolygon_handlesEdgeCasesGracefully() {
        // null list - should not crash
        GeofenceUtils.normalizePolygon(null);
        
        // empty list
        List<GeoPoint> empty = new java.util.ArrayList<>();
        GeofenceUtils.normalizePolygon(empty);
        assertTrue(empty.isEmpty());
        
        // too small list (size 2)
        List<GeoPoint> small = new java.util.ArrayList<>(Arrays.asList(
            new GeoPoint(13.0, 100.0),
            new GeoPoint(14.0, 100.0)
        ));
        GeofenceUtils.normalizePolygon(small);
        org.junit.Assert.assertEquals(2, small.size());
    }
}
