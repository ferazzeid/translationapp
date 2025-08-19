import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["wake_lock_enabled", "managed_mode_enabled", "hold_to_record_enabled"]);

      if (error) throw error;

      data?.forEach((setting) => {
        switch (setting.setting_key) {
          case "wake_lock_enabled":
            setWakeLockEnabled(setting.setting_value === "true");
            break;
          case "managed_mode_enabled":
            setManagedModeEnabled(setting.setting_value === "true");
            break;
          case "hold_to_record_enabled":
            setHoldToRecordEnabled(setting.setting_value === "true");
            break;
        }
      });
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase.rpc("set_admin_setting", {
        key_name: key,
        value: value,
        encrypted: false
      });

      if (error) throw error;

      const settingName = key === "wake_lock_enabled" ? "Wake lock setting" : 
                         key === "managed_mode_enabled" ? "Managed mode setting" :
                         "Hold to record setting";

      toast({
        title: "Success",
        description: `${settingName} saved successfully`,
      });
    } catch (error: any) {
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
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="theme-surface theme-border">
        <CardHeader>
          <CardTitle className="theme-text">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSettings />
        </CardContent>
      </Card>

      <Separator />

      {/* App Behavior Settings */}
      <Card className="theme-surface theme-border">
        <CardHeader>
          <CardTitle className="theme-text">App Behavior</CardTitle>
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
                AI-managed turn-taking system with visual indicators (Beta feature)
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