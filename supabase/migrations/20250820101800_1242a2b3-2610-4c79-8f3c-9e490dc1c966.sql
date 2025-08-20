-- Add STT provider configuration settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES 
('stt_provider', 'openai', 'Speech-to-text provider: openai or google_streaming')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_settings (setting_key, setting_value, description) VALUES 
('stt_fallback_provider', 'openai', 'Fallback STT provider when primary fails')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_settings (setting_key, setting_value, description) VALUES 
('stt_timeout', '60000', 'STT streaming session timeout in milliseconds')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_settings (setting_key, setting_value, description) VALUES 
('stt_telemetry_enabled', 'false', 'Enable STT performance telemetry logging')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_settings (setting_key, setting_value, description) VALUES 
('stt_developer_mode', 'false', 'Enable developer mode for STT provider testing')
ON CONFLICT (setting_key) DO NOTHING;