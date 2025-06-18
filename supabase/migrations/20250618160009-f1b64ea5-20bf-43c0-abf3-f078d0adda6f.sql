
-- Create user preferences table for area settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared disaster data table
CREATE TABLE public.shared_disaster_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  disaster_type TEXT NOT NULL,
  data JSONB NOT NULL,
  location JSONB NOT NULL,
  shared_with TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create disaster statistics table for dashboard
CREATE TABLE public.disaster_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disaster_type TEXT NOT NULL,
  province TEXT NOT NULL,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  severity_level INTEGER NOT NULL DEFAULT 1,
  affected_area DECIMAL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_disaster_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_statistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for shared_disaster_data
CREATE POLICY "Users can view their own shared data" 
  ON public.shared_disaster_data 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create shared data" 
  ON public.shared_disaster_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared data" 
  ON public.shared_disaster_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared data" 
  ON public.shared_disaster_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for disaster_statistics (public read-only)
CREATE POLICY "Anyone can view disaster statistics" 
  ON public.disaster_statistics 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_shared_disaster_data_user_id ON public.shared_disaster_data(user_id);
CREATE INDEX idx_shared_disaster_data_type ON public.shared_disaster_data(disaster_type);
CREATE INDEX idx_disaster_statistics_type_date ON public.disaster_statistics(disaster_type, date);
CREATE INDEX idx_disaster_statistics_province ON public.disaster_statistics(province);

-- Insert some sample disaster statistics data
INSERT INTO public.disaster_statistics (disaster_type, province, date, count, severity_level, affected_area, metadata) VALUES
('earthquake', 'กรุงเทพมหานคร', '2024-01-01', 5, 2, 100.5, '{"magnitude_avg": 3.2}'),
('earthquake', 'เชียงใหม่', '2024-01-01', 3, 1, 50.2, '{"magnitude_avg": 2.8}'),
('flood', 'อยุธยา', '2024-01-01', 8, 3, 1200.7, '{"water_level": 2.5}'),
('wildfire', 'เชียงราย', '2024-01-01', 12, 2, 850.3, '{"hotspots": 45}'),
('earthquake', 'กรุงเทพมหานคร', '2024-01-02', 3, 1, 75.2, '{"magnitude_avg": 2.9}'),
('flood', 'อยุธยา', '2024-01-02', 6, 2, 980.4, '{"water_level": 2.1}'),
('wildfire', 'เชียงราย', '2024-01-02', 15, 3, 920.8, '{"hotspots": 52}');
