
-- Create incident_reports table
CREATE TABLE public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  coordinates JSONB,
  severity_level INTEGER NOT NULL DEFAULT 3,
  contact_info TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view incident reports (public data)
CREATE POLICY "Anyone can view incident reports" 
  ON public.incident_reports 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow anyone to create incident reports
CREATE POLICY "Anyone can create incident reports" 
  ON public.incident_reports 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create storage bucket for incident images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-images', 'incident-images', true);

-- Create policy for incident images bucket - allow public access
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'incident-images');

CREATE POLICY "Public Upload" ON storage.objects 
FOR INSERT TO public WITH CHECK (bucket_id = 'incident-images');

CREATE POLICY "Public Update" ON storage.objects 
FOR UPDATE TO public USING (bucket_id = 'incident-images');

CREATE POLICY "Public Delete" ON storage.objects 
FOR DELETE TO public USING (bucket_id = 'incident-images');
