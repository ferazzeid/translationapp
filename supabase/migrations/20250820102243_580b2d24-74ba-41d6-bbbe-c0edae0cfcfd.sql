-- Add Google Cloud service account key setting to admin_settings
INSERT INTO admin_settings (setting_key, setting_value, is_encrypted)
VALUES ('google_cloud_service_account_key', '', true)
ON CONFLICT (setting_key) DO NOTHING;