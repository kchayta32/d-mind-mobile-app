
-- Create notifications table for storing notification history
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  severity_level INTEGER NOT NULL DEFAULT 1,
  delivery_methods JSONB NOT NULL DEFAULT '{"push": true, "email": false, "sms": false}'::jsonb,
  location_data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_locations table for geolocation-based alerts
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  coordinates JSONB NOT NULL,
  location_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_data table for dashboard statistics
CREATE TABLE public.analytics_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  location_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for user_locations
CREATE POLICY "Users can manage their own locations" 
  ON public.user_locations 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for analytics_data (public read access for dashboard)
CREATE POLICY "Everyone can view analytics data" 
  ON public.analytics_data 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can manage analytics data" 
  ON public.analytics_data 
  FOR ALL 
  USING (true);

-- Add realtime support for new tables
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_locations REPLICA IDENTITY FULL;
ALTER TABLE public.analytics_data REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_data;

-- Create function to calculate distance for location-based alerts
CREATE OR REPLACE FUNCTION public.get_nearby_users(
  alert_lat NUMERIC,
  alert_lng NUMERIC,
  radius_km NUMERIC DEFAULT 50
)
RETURNS TABLE(user_id UUID, distance_km NUMERIC)
LANGUAGE sql
AS $$
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
$$;

-- Create function to automatically populate analytics data
CREATE OR REPLACE FUNCTION public.update_analytics_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;
