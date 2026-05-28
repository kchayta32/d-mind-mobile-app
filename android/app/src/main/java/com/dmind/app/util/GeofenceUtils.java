package com.dmind.app.util;

import android.content.Context;
import android.graphics.Color;
import android.location.Location;

import com.dmind.app.model.GeoPoint;

import java.util.List;

/**
 * GeofenceUtils - Provides geometric calculations for disaster zone monitoring.
 * 
 * This utility class:
 * 1. Determines if a point is inside a polygon (Ray Casting Algorithm)
 * 2. Calculates distance between two GeoPoints (Haversine Formula)
 * 3. Determines if user is entering/exiting danger zones
 */
public class GeofenceUtils {
    
    /**
     * Determine if a point is inside a polygon using Ray Casting Algorithm
     * 
     * @param point - GeoPoint {lat, lng}
     * @param polygon - List of GeoPoints defining polygon vertices (must be closed)
     * @return true if inside polygon, false otherwise
     */
    public static boolean isPointInPolygon(GeoPoint point, List<GeoPoint> polygon) {
        int n = polygon.size();
        double x = point.getLongitude();
        double y = point.getLatitude();
        boolean inside = false;
        
        // Ray casting algorithm
        for (int i = 0, j = n - 1; i < n; j = i++) {
            double xi = polygon.get(i).getLongitude();
            double yi = polygon.get(i).getLatitude();
            double xj = polygon.get(j).getLongitude();
            double yj = polygon.get(j).getLatitude();
            
            boolean intersect = ((yi > y) != (yj > y)) &&
                               (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    /**
     * Determine if multiple points are inside a polygon
     * 
     * @param points - Array of GeoPoints
     * @param polygon - List of GeoPoints defining polygon vertices
     * @return true if ALL points are inside polygon
     */
    public static boolean arePointsInPolygon(GeoPoint[] points, List<GeoPoint> polygon) {
        for (GeoPoint point : points) {
            if (!isPointInPolygon(point, polygon)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Calculate distance between two GeoPoints using Haversine Formula
     * 
     * @param p1 - First GeoPoint
     * @param p2 - Second GeoPoint
     * @return distance in meters (double)
     */
    public static double calculateDistance(GeoPoint p1, GeoPoint p2) {
        int R = 6371000; // Earth radius in meters
        
        double lat1 = Math.toRadians(p1.getLatitude());
        double lat2 = Math.toRadians(p2.getLatitude());
        double deltaLat = Math.toRadians(p2.getLatitude() - p1.getLatitude());
        double deltaLon = Math.toRadians(p2.getLongitude() - p1.getLongitude());
        
        double a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                   Math.cos(lat1) * Math.cos(lat2) *
                   Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    /**
     * Calculate distance from a point to a polygon edge (closest edge)
     * 
     * @param point - GeoPoint
     * @param polygon - List of GeoPoints
     * @return distance in meters to closest polygon edge
     */
    public static double calculateDistanceToPolygonEdge(GeoPoint point, List<GeoPoint> polygon) {
        double minDistance = Double.MAX_VALUE;
        
        for (int i = 0; i < polygon.size() - 1; i++) {
            GeoPoint p1 = polygon.get(i);
            GeoPoint p2 = polygon.get(i + 1);
            
            double distance = calculateDistanceToLineSegment(point, p1, p2);
            minDistance = Math.min(minDistance, distance);
        }
        
        // Also check distance to last segment (closing the polygon)
        if (polygon.size() > 2) {
            GeoPoint p1 = polygon.get(polygon.size() - 1);
            GeoPoint p2 = polygon.get(0);
            double distance = calculateDistanceToLineSegment(point, p1, p2);
            minDistance = Math.min(minDistance, distance);
        }
        
        return minDistance;
    }
    
    /**
     * Calculate distance from point to line segment
     */
    private static double calculateDistanceToLineSegment(GeoPoint point, GeoPoint p1, GeoPoint p2) {
        // Convert to Cartesian coordinates (simplified for small distances)
        double x = point.getLongitude();
        double y = point.getLatitude();
        double x1 = p1.getLongitude();
        double y1 = p1.getLatitude();
        double x2 = p2.getLongitude();
        double y2 = p2.getLatitude();
        
        double A = x - x1;
        double B = y - y1;
        double C = x2 - x1;
        double D = y2 - y1;
        
        double dot = A * C + B * D;
        double lenSq = C * C + D * D;
        double param = -1;
        
        if (lenSq != 0) {
            param = dot / lenSq;
        }
        
        double xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        // Calculate distance
        return calculateDistance(point, new GeoPoint(yy, xx));
    }
    
    /**
     * Check if user is approaching a danger zone (within buffer distance)
     * 
     * @param point - Current user location
     * @param polygon - Danger zone polygon
     * @param bufferMeters - Buffer distance in meters
     * @return true if user is near danger zone
     */
    public static boolean isApproachingDangerZone(GeoPoint point, List<GeoPoint> polygon, double bufferMeters) {
        // If already inside, return true
        if (isPointInPolygon(point, polygon)) {
            return true;
        }
        
        // Check distance to polygon edge
        double distanceToEdge = calculateDistanceToPolygonEdge(point, polygon);
        return distanceToEdge <= bufferMeters;
    }
    
    /**
     * Calculate area of a polygon (for debugging/validation)
     * Uses Surveyor's Formula (Shoelace Theorem)
     */
    public static double calculatePolygonArea(List<GeoPoint> polygon) {
        int n = polygon.size();
        double area = 0.0;
        
        for (int i = 0; i < n; i++) {
            int j = (i + 1) % n;
            double xi = polygon.get(i).getLongitude();
            double yi = polygon.get(i).getLatitude();
            double xj = polygon.get(j).getLongitude();
            double yj = polygon.get(j).getLatitude();
            
            area += xi * yj - xj * yi;
        }
        
        return Math.abs(area) / 2.0;
    }
    
    /**
     * Check if polygon is properly closed (first and last points should be same)
     */
    public static boolean isPolygonClosed(List<GeoPoint> polygon) {
        if (polygon.size() < 3) {
            return false;
        }
        
        GeoPoint first = polygon.get(0);
        GeoPoint last = polygon.get(polygon.size() - 1);
        
        return Math.abs(first.getLatitude() - last.getLatitude()) < 0.000001 &&
               Math.abs(first.getLongitude() - last.getLongitude()) < 0.000001;
    }
    
    /**
     * Normalize polygon points (ensure proper order for Ray Casting)
     */
    public static void normalizePolygon(List<GeoPoint> polygon) {
        if (polygon == null || polygon.size() < 3) {
            return;
        }
        
        // 1. Ensure the polygon is closed. If not, close it by appending the first point.
        if (!isPolygonClosed(polygon)) {
            GeoPoint first = polygon.get(0);
            polygon.add(new GeoPoint(first.getLatitude(), first.getLongitude()));
        }
        
        // 2. Verify winding order. We want it to be counter-clockwise (CCW) for standard Ray Casting / GIS consistency.
        // If winding order is clockwise (CW), reverse the list.
        double signedArea = calculateSignedArea(polygon);
        if (signedArea < 0) {
            java.util.Collections.reverse(polygon);
        }
    }

    /**
     * Calculate the signed area of a polygon.
     * Positive value indicates counter-clockwise (CCW) order,
     * negative indicates clockwise (CW) order.
     */
    private static double calculateSignedArea(List<GeoPoint> polygon) {
        int n = polygon.size();
        double area = 0.0;
        for (int i = 0; i < n; i++) {
            int j = (i + 1) % n;
            double xi = polygon.get(i).getLongitude();
            double yi = polygon.get(i).getLatitude();
            double xj = polygon.get(j).getLongitude();
            double yj = polygon.get(j).getLatitude();
            area += xi * yj - xj * yi;
        }
        return area / 2.0;
    }
    
    /**
     * Get bounding box of a polygon
     */
    public static GeoPoint[] getBoundingBox(List<GeoPoint> polygon) {
        if (polygon.isEmpty()) {
            return null;
        }
        
        double minLat = Double.MAX_VALUE;
        double maxLat = -Double.MAX_VALUE;
        double minLon = Double.MAX_VALUE;
        double maxLon = -Double.MAX_VALUE;
        
        for (GeoPoint point : polygon) {
            minLat = Math.min(minLat, point.getLatitude());
            maxLat = Math.max(maxLat, point.getLatitude());
            minLon = Math.min(minLon, point.getLongitude());
            maxLon = Math.max(maxLon, point.getLongitude());
        }
        
        return new GeoPoint[] {
            new GeoPoint(minLat, minLon),
            new GeoPoint(maxLat, maxLon)
        };
    }
}
