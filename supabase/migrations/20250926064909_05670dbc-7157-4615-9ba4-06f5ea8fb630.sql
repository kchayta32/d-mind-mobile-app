-- Fix the security definer view by removing it and using proper policies instead
DROP VIEW IF EXISTS public.victim_reports_public;

-- Fix search_path for existing functions that don't have it set
-- Update existing functions to have proper search_path

-- Update the user_has_role function (already created with search_path but let's ensure it's correct)
CREATE OR REPLACE FUNCTION public.user_has_role(check_user_id UUID, required_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
      AND role = required_role 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update the user_is_emergency_authorized function
CREATE OR REPLACE FUNCTION public.user_is_emergency_authorized(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
      AND role IN ('admin', 'emergency_responder') 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix the existing functions that have mutable search_path
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric AS $$
BEGIN
  RETURN 6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) * 
    cos(radians(lon2) - radians(lon1)) + 
    sin(radians(lat1)) * sin(radians(lat2))
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_analytics_stats()
RETURNS void AS $$
BEGIN
  -- Insert daily disaster counts by type
  INSERT INTO analytics_data (metric_name, metric_value, metric_type, location_data)
  SELECT 
    'daily_' || alert_type || '_count',
    COUNT(*),
    'disaster_count',
    jsonb_build_object('alert_type', alert_type)
  FROM realtime_alerts 
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY alert_type
  ON CONFLICT DO NOTHING;

  -- Insert severity level distribution
  INSERT INTO analytics_data (metric_name, metric_value, metric_type)
  SELECT 
    'severity_level_' || severity_level || '_count',
    COUNT(*),
    'severity_distribution'
  FROM realtime_alerts 
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY severity_level
  ON CONFLICT DO NOTHING;

  -- Insert active alerts count
  INSERT INTO analytics_data (metric_name, metric_value, metric_type)
  VALUES (
    'active_alerts_count',
    (SELECT COUNT(*) FROM realtime_alerts WHERE is_active = true),
    'system_metric'
  )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_damage_assessment_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_users_in_alert_radius(alert_coordinates jsonb, alert_radius numeric)
RETURNS TABLE(user_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT uas.user_id
  FROM user_alert_subscriptions uas
  WHERE uas.is_active = true
    AND calculate_distance(
      (alert_coordinates->>'lat')::DECIMAL,
      (alert_coordinates->>'lng')::DECIMAL,
      (uas.location_preferences->>'lat')::DECIMAL,
      (uas.location_preferences->>'lng')::DECIMAL
    ) <= LEAST(alert_radius, uas.radius_km);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_nearby_users(alert_lat numeric, alert_lng numeric, radius_km numeric DEFAULT 50)
RETURNS TABLE(user_id uuid, distance_km numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ul.user_id,
    calculate_distance(
      alert_lat,
      alert_lng,
      (ul.coordinates->>'lat')::NUMERIC,
      (ul.coordinates->>'lng')::NUMERIC
    ) as distance_km
  FROM user_locations ul
  WHERE ul.is_active = true
    AND calculate_distance(
      alert_lat,
      alert_lng,
      (ul.coordinates->>'lat')::NUMERIC,
      (ul.coordinates->>'lng')::NUMERIC
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SET search_path = public;