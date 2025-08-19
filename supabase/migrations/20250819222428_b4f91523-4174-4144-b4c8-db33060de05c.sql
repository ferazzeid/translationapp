-- Fix admin settings access - create profiles table trigger and update RLS policies
-- First, ensure the trigger exists for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email, 'User'));
  RETURN NEW;
END;
$$;

-- Recreate the trigger (in case it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a profile for any existing authenticated users without profiles
INSERT INTO public.profiles (user_id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data ->> 'display_name', u.email, 'User')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Update RLS policies to allow any authenticated user to read admin settings
-- but only admin users to modify them
DROP POLICY IF EXISTS "Users can view admin settings" ON admin_settings;
CREATE POLICY "Users can view admin settings" 
ON admin_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep existing admin-only policies for modifications
-- The existing policies should remain for INSERT, UPDATE, DELETE operations