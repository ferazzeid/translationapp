import { useState, useEffect } from "react";
import { Palette, Settings } from "lucide-react";
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
      console.log('AppSettings: Loading admin settings from database...');
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["wake_lock_enabled", "managed_mode_enabled", "hold_to_record_enabled"]);

      if (error) throw error;

      data?.forEach((setting) => {
        const value = setting.setting_value === "true";
        
        switch (setting.setting_key) {
          case "wake_lock_enabled":
            setWakeLockEnabled(value);
            break;
          case "managed_mode_enabled":
            setManagedModeEnabled(value);
            break;
          case "hold_to_record_enabled":
            setHoldToRecordEnabled(value);
            break;
        }
      });
    } catch (error: any) {
      console.error('Error loading admin settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("admin_settings")
        .update({ setting_value: value.toString() })
        .eq("setting_key", key);

      if (updateError) {
        // If update failed, try to insert
        const { error: insertError } = await supabase
          .from("admin_settings")
          .insert({ 
            setting_key: key, 
            setting_value: value.toString(),
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update setting: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleWakeLockToggle = (value: boolean) => {
    setWakeLockEnabled(value);
    updateSetting("wake_lock_enabled", value);
  };

  const handleManagedModeToggle = (value: boolean) => {
    setManagedModeEnabled(value);
    updateSetting("managed_mode_enabled", value);
  };

  const handleHoldToRecordToggle = (value: boolean) => {
    setHoldToRecordEnabled(value);
    updateSetting("hold_to_record_enabled", value);
  };

  return (
    <div className="space-y-6">
      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSettings />
        </CardContent>
      </Card>

      {/* App Behavior Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            App Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Screen Wake Lock */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="wake-lock" className="text-sm font-medium">
                Screen Wake Lock
              </Label>
              <p className="text-xs text-muted-foreground">
                Keep screen on during translation sessions
              </p>
            </div>
            <Switch
              id="wake-lock"
              checked={wakeLockEnabled}
              onCheckedChange={handleWakeLockToggle}
            />
          </div>

          <Separator />

          {/* Managed Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="managed-mode" className="text-sm font-medium">
                Managed Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn-based conversation management
              </p>
            </div>
            <Switch
              id="managed-mode"
              checked={managedModeEnabled}
              onCheckedChange={handleManagedModeToggle}
            />
          </div>

          <Separator />

          {/* Recording Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="hold-to-record" className="text-sm font-medium">
                Recording Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                {holdToRecordEnabled ? "Hold to record" : "Tap to start/stop recording"}
              </p>
            </div>
            <Switch
              id="hold-to-record"
              checked={holdToRecordEnabled}
              onCheckedChange={handleHoldToRecordToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};