-- Create storage bucket for admin uploads (logos, favicons, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-assets', 'admin-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for admin assets bucket
CREATE POLICY "Admin users can upload assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'admin-assets' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.display_name = 'admin' OR profiles.display_name ILIKE '%admin%')
  )
);

CREATE POLICY "Admin users can update assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'admin-assets' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.display_name = 'admin' OR profiles.display_name ILIKE '%admin%')
  )
);

CREATE POLICY "Admin users can delete assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'admin-assets' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.display_name = 'admin' OR profiles.display_name ILIKE '%admin%')
  )
);

CREATE POLICY "Assets are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admin-assets');