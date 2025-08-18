-- Create admin settings table for storing API keys and app configuration
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  is_encrypted boolean DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for admin settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin settings (restrict to authenticated users with admin role)
CREATE POLICY "Admin users can view all settings" 
ON public.admin_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (display_name = 'admin' OR display_name ILIKE '%admin%')
));

CREATE POLICY "Admin users can insert settings" 
ON public.admin_settings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (display_name = 'admin' OR display_name ILIKE '%admin%')
));

CREATE POLICY "Admin users can update settings" 
ON public.admin_settings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (display_name = 'admin' OR display_name ILIKE '%admin%')
));

CREATE POLICY "Admin users can delete settings" 
ON public.admin_settings 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND (display_name = 'admin' OR display_name ILIKE '%admin%')
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('openai_api_key', NULL, 'OpenAI API key for translation and TTS services'),
('voice_model', 'alloy', 'Default OpenAI TTS voice model'),
('voice_speed', '1.0', 'Default voice playback speed'),
('default_speaker_a_language', 'en', 'Default language for Speaker A'),
('default_speaker_b_language', 'es', 'Default language for Speaker B'),
('subscription_mode', 'admin_provided', 'API key mode: admin_provided or user_provided'),
('app_name', 'Translation App', 'Application display name');

-- Function to safely get decrypted settings (placeholder for future encryption)
CREATE OR REPLACE FUNCTION public.get_admin_setting(key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  SELECT setting_value INTO result
  FROM admin_settings
  WHERE setting_key = key_name;
  
  RETURN result;
END;
$$;

-- Function to safely set encrypted settings (placeholder for future encryption)
CREATE OR REPLACE FUNCTION public.set_admin_setting(key_name text, value text, encrypted boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_settings (setting_key, setting_value, is_encrypted)
  VALUES (key_name, value, encrypted)
  ON CONFLICT (setting_key)
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    is_encrypted = EXCLUDED.is_encrypted,
    updated_at = now();
END;
$$;