
-- Create table for real-time alerts
CREATE TABLE public.realtime_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  radius_km DECIMAL NOT NULL DEFAULT 10.0,
  affected_provinces TEXT[],
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create table for user alert subscriptions
CREATE TABLE public.user_alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_types TEXT[] NOT NULL,
  location_preferences JSONB NOT NULL,
  radius_km DECIMAL NOT NULL DEFAULT 50.0,
  min_severity_level INTEGER NOT NULL DEFAULT 1,
  notification_methods JSONB NOT NULL DEFAULT '{"push": true, "email": false, "sms": false}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for alert delivery tracking
CREATE TABLE public.alert_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES realtime_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  delivery_method TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.realtime_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for realtime_alerts (public read, admin write)
CREATE POLICY "Anyone can view active alerts" 
  ON public.realtime_alerts 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can create alerts" 
  ON public.realtime_alerts 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own alerts" 
  ON public.realtime_alerts 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- RLS policies for user_alert_subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
  ON public.user_alert_subscriptions 
  FOR ALL 
  USING (user_id = auth.uid());

-- RLS policies for alert_deliveries
CREATE POLICY "Users can view their own deliveries" 
  ON public.alert_deliveries 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can insert deliveries" 
  ON public.alert_deliveries 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update delivery status" 
  ON public.alert_deliveries 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE alert_deliveries;

-- Set up REPLICA IDENTITY for realtime
ALTER TABLE public.realtime_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.alert_deliveries REPLICA IDENTITY FULL;

-- Create indexes for performance
CREATE INDEX idx_realtime_alerts_location ON realtime_alerts USING GIN (coordinates);
CREATE INDEX idx_realtime_alerts_active ON realtime_alerts (is_active, expires_at);
CREATE INDEX idx_realtime_alerts_severity ON realtime_alerts (severity_level, created_at);
CREATE INDEX idx_user_subscriptions_user_id ON user_alert_subscriptions (user_id);
CREATE INDEX idx_alert_deliveries_alert_user ON alert_deliveries (alert_id, user_id);
CREATE INDEX idx_alert_deliveries_status ON alert_deliveries (delivery_status, created_at);

-- Function to calculate distance between coordinates
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL, 
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN 6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) * 
    cos(radians(lon2) - radians(lon1)) + 
    sin(radians(lat1)) * sin(radians(lat2))
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get users within alert radius
CREATE OR REPLACE FUNCTION get_users_in_alert_radius(
  alert_coordinates JSONB,
  alert_radius DECIMAL
) RETURNS TABLE(user_id UUID) AS $$
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
$$ LANGUAGE plpgsql;
