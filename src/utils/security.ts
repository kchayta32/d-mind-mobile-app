
import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and trim
  const sanitized = sanitizeHtml(input).trim();
  
  // Limit length
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

// Coordinate validation
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

// Location privacy options
export interface LocationPrivacyOptions {
  useExactLocation: boolean;
  approximationRadius?: number; // in meters
}

export const approximateLocation = (
  lat: number, 
  lng: number, 
  radiusMeters: number = 1000
): { lat: number; lng: number } => {
  // Add random offset within radius for privacy
  const radiusInDegrees = radiusMeters / 111000; // Rough conversion to degrees
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * radiusInDegrees;
  
  return {
    lat: lat + Math.cos(randomAngle) * randomRadius,
    lng: lng + Math.sin(randomAngle) * randomRadius
  };
};

// Rate limiting for client-side
export class ClientRateLimit {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

// Generic error handler that doesn't expose sensitive info
export const handleSecureError = (error: any): string => {
  console.error('Security filtered error:', error);
  
  // Return generic message for users, log detailed error for debugging
  if (error?.message?.includes('auth') || error?.message?.includes('permission')) {
    return 'Authentication required. Please log in to continue.';
  }
  
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'An error occurred. Please try again later.';
};
