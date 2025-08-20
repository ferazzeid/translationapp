import { useState, useEffect } from "react";
import { Palette, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { settingsCache } from "@/utils/settingsCache";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ThemeSettings } from "./ThemeSettings";

export const AppSettings = () => {
  const [wakeLockEnabled, setWakeLockEnabled] = useState(true);
  const [managedModeEnabled, setManagedModeEnabled] = useState(false);
  const [holdToRecordEnabled, setHoldToRecordEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check cache first (24 hour expiry for admin settings)
      const cached = settingsCache.get<Record<string, boolean>>('admin_settings');
      if (cached) {
        console.log('AppSettings: Using cached admin settings');
        setWakeLockEnabled(cached.wake_lock_enabled ?? true);
        setManagedModeEnabled(cached.managed_mode_enabled ?? false);
        setHoldToRecordEnabled(cached.hold_to_record_enabled ?? false);
        return;
      }

      console.log('AppSettings: Loading settings from database...');
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["wake_lock_enabled", "managed_mode_enabled", "hold_to_record_enabled"]);

      if (error) {
        console.error('AppSettings: Error loading settings:', error);
        throw error;
      }

      console.log('AppSettings: Loaded settings data:', data);

      // Set defaults first
      const settings: Record<string, boolean> = {
        wake_lock_enabled: true,
        managed_mode_enabled: false,
        hold_to_record_enabled: false
      };

      // Then update with actual values from database
      data?.forEach((setting) => {
        const value = setting.setting_value === "true";
        console.log(`AppSettings: Setting ${setting.setting_key} to ${value}`);
        settings[setting.setting_key] = value;
      });

      // Cache for 24 hours
      settingsCache.set('admin_settings', settings, 1440);

      // Update state
      setWakeLockEnabled(settings.wake_lock_enabled);
      setManagedModeEnabled(settings.managed_mode_enabled);
      setHoldToRecordEnabled(settings.hold_to_record_enabled);
    } catch (error: any) {
      console.error('AppSettings: Error loading settings:', error);
      toast({
        title: "Error Loading Settings",
        description: `Failed to load settings: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      console.log(`AppSettings: Updating ${key} to ${value}`);
      
      // First try to update existing record
      const { error: updateError } = await supabase
        .from("admin_settings")
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq("setting_key", key);

      if (updateError) {
        console.log(`AppSettings: Update failed, trying insert. Error:`, updateError);
        
        // If update fails (no existing record), try insert
        const { error: insertError } = await supabase
          .from("admin_settings")
          .insert({ 
            setting_key: key, 
            setting_value: value,
            description: `User preference for ${key}`,
            is_encrypted: false
          });

        if (insertError) {
          console.error(`AppSettings: Insert also failed:`, insertError);
          throw insertError;
        }
        console.log(`AppSettings: Successfully inserted ${key} = ${value}`);
      } else {
        console.log(`AppSettings: Successfully updated ${key} = ${value}`);
      }

      // Invalidate cache so it reloads on next access
      settingsCache.invalidate('admin_settings');

      const settingName = key === "wake_lock_enabled" ? "Wake lock setting" : 
                         key === "managed_mode_enabled" ? "Managed mode setting" :
                         "Hold to record setting";

      toast({
        title: "Success",
        description: `${settingName} saved successfully`,
      });
    } catch (error: any) {
      console.error(`AppSettings: Failed to save ${key}:`, error);
      toast({
        title: "Error",
        description: `Failed to save setting: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleWakeLockToggle = async (enabled: boolean) => {
    setWakeLockEnabled(enabled);
    await updateSetting("wake_lock_enabled", enabled.toString());
  };

  const handleManagedModeToggle = async (enabled: boolean) => {
    setManagedModeEnabled(enabled);
    await updateSetting("managed_mode_enabled", enabled.toString());
  };

  const handleHoldToRecordToggle = async (enabled: boolean) => {
    setHoldToRecordEnabled(enabled);
    await updateSetting("hold_to_record_enabled", enabled.toString());
  };

  return (
    <div className="space-y-4">
      {/* Theme Settings */}
      <Card className="theme-surface theme-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Palette className="h-5 w-5 theme-icon" />
            <span className="theme-text">Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSettings />
        </CardContent>
      </Card>

      {/* App Behavior Settings */}
      <Card className="theme-surface theme-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Settings className="h-5 w-5 theme-icon" />
            <span className="theme-text">App Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wake Lock Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium theme-text mb-1">Screen Wake Lock</h3>
              <p className="text-sm theme-text-muted">
                Prevents device screen from sleeping during conversations
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="wake-lock" className="text-sm theme-text">
                Enable Wake Lock
              </Label>
              <Switch
                id="wake-lock"
                checked={wakeLockEnabled}
                onCheckedChange={handleWakeLockToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Managed Mode Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium theme-text mb-1">Managed Mode</h3>
              <p className="text-sm theme-text-muted">
                AI-managed turn-taking system with visual indicators
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="managed-mode" className="text-sm theme-text">
                Enable Managed Mode
              </Label>
              <Switch
                id="managed-mode"
                checked={managedModeEnabled}
                onCheckedChange={handleManagedModeToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Hold to Record Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium theme-text mb-1">Recording Mode</h3>
              <p className="text-sm theme-text-muted">
                Choose between tap-to-record or hold-to-record interaction
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="hold-to-record" className="text-sm theme-text">
                Hold to Record Mode
              </Label>
              <Switch
                id="hold-to-record"
                checked={holdToRecordEnabled}
                onCheckedChange={handleHoldToRecordToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};