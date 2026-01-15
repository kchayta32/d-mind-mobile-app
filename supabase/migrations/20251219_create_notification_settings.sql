-- Create table for storing user notification preferences on server
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Nullable for now to allow quick testing without auth
    email TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    radius_km INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (Simplifies logic for this phase, tighten later)
CREATE POLICY "Allow public select" ON public.user_notification_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.user_notification_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.user_notification_settings FOR UPDATE USING (true);
