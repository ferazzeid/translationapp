-- Update admin settings policies to allow all authenticated users to manage these specific settings
-- These are user preference settings, not true admin settings
DROP POLICY IF EXISTS "Admin users can update settings" ON admin_settings;
DROP POLICY IF EXISTS "Admin users can insert settings" ON admin_settings;

-- Allow authenticated users to update these specific user preference settings
CREATE POLICY "Users can update preference settings" 
ON admin_settings 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND setting_key IN ('wake_lock_enabled', 'managed_mode_enabled', 'hold_to_record_enabled')
);

-- Allow authenticated users to insert these specific user preference settings  
CREATE POLICY "Users can insert preference settings" 
ON admin_settings 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND setting_key IN ('wake_lock_enabled', 'managed_mode_enabled', 'hold_to_record_enabled')
);

-- Keep admin-only access for true admin settings (like app_name, etc.)
CREATE POLICY "Admin users can update admin settings" 
ON admin_settings 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND (display_name = 'admin' OR display_name ILIKE '%admin%')
  )
  AND setting_key NOT IN ('wake_lock_enabled', 'managed_mode_enabled', 'hold_to_record_enabled')
);

CREATE POLICY "Admin users can insert admin settings" 
ON admin_settings 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND (display_name = 'admin' OR display_name ILIKE '%admin%')
  )
  AND setting_key NOT IN ('wake_lock_enabled', 'managed_mode_enabled', 'hold_to_record_enabled')
);