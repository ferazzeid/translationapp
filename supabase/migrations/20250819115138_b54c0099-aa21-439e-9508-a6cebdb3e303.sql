-- Add admin settings for branding customization
INSERT INTO admin_settings (setting_key, setting_value, description, is_encrypted) 
VALUES 
  ('app_name', 'Translation App', 'Application name for PWA and branding', false),
  ('app_logo_url', '', 'URL or path to the application logo', false),
  ('favicon_url', '', 'URL or path to the favicon', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  is_encrypted = EXCLUDED.is_encrypted,
  updated_at = now();