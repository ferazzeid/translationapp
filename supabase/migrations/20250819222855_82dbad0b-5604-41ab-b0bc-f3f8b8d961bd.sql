-- Create missing icon settings and map existing favicon/logo to icon settings
INSERT INTO admin_settings (setting_key, setting_value, description, is_encrypted)
SELECT 'app_icon_192', setting_value, 'PWA icon 192x192', false
FROM admin_settings 
WHERE setting_key IN ('favicon_url', 'app_logo_url') 
AND setting_value != ''
AND NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'app_icon_192')
LIMIT 1;

INSERT INTO admin_settings (setting_key, setting_value, description, is_encrypted)
SELECT 'app_icon_512', setting_value, 'PWA icon 512x512', false
FROM admin_settings 
WHERE setting_key IN ('favicon_url', 'app_logo_url') 
AND setting_value != ''
AND NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'app_icon_512')
LIMIT 1;