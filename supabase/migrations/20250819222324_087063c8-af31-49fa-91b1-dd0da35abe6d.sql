-- Update app branding settings to use TalkDuo instead of hardcoded names
UPDATE admin_settings 
SET setting_value = 'TalkDuo'
WHERE setting_key = 'app_name' AND setting_value IN ('Translation App', 'Translation Bridge', 'translationapp');

-- Set default app name if it doesn't exist
INSERT INTO admin_settings (setting_key, setting_value, description, is_encrypted) 
VALUES ('app_name', 'TalkDuo', 'Application name for PWA and branding', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = CASE 
    WHEN admin_settings.setting_value IN ('Translation App', 'Translation Bridge', 'translationapp', '') 
    THEN 'TalkDuo'
    ELSE admin_settings.setting_value
  END,
  updated_at = now();