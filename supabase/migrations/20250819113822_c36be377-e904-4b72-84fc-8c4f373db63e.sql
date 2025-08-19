-- Add admin settings for wake lock and managed mode features
INSERT INTO admin_settings (setting_key, setting_value, description, is_encrypted) 
VALUES 
  ('wake_lock_enabled', 'true', 'Enable screen wake lock to prevent device from sleeping during conversations', false),
  ('managed_mode_enabled', 'false', 'Enable managed turn-taking mode (admin feature)', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  is_encrypted = EXCLUDED.is_encrypted,
  updated_at = now();