-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'premium', 'expired')),
ADD COLUMN trial_started_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN trial_api_calls_used INTEGER DEFAULT 0,
ADD COLUMN subscription_expires_at TIMESTAMPTZ;

-- Create admin settings for trial configuration
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('trial_api_call_limit', '100', 'Maximum API calls allowed during 24-hour trial'),
('trial_duration_hours', '24', 'Trial duration in hours')
ON CONFLICT (setting_key) DO NOTHING;

-- Update existing profiles to have trial status if they don't have subscription_status
UPDATE public.profiles 
SET subscription_status = 'trial', 
    trial_started_at = now() 
WHERE subscription_status IS NULL;