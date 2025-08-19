import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Settings, X } from "lucide-react";
import { MobileFrame } from "./MobileFrame";
import { ThemeSettings } from "./ThemeSettings";
import { cn } from "@/lib/utils";

interface AdminSettingsProps {
  onBackToApp: () => void;
  onSignOut: () => void;
  onOpenDashboard: () => void;
}

export const AdminSettings = ({ onBackToApp, onSignOut, onOpenDashboard }: AdminSettingsProps) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
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
        .in("setting_key", ["openai_api_key", "wake_lock_enabled", "managed_mode_enabled", "hold_to_record_enabled"]);

      if (error) throw error;

      data?.forEach((setting) => {
        switch (setting.setting_key) {
          case "openai_api_key":
            setOpenaiKey(setting.setting_value || "");
            break;
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

  const updateSetting = async (key: string, value: string, encrypted: boolean = false) => {
    try {
      const { error } = await supabase.rpc("set_admin_setting", {
        key_name: key,
        value: value,
        encrypted: encrypted
      });

      if (error) throw error;

      const settingName = key === "openai_api_key" ? "API key" : 
                         key === "wake_lock_enabled" ? "Wake lock setting" : 
                         key === "managed_mode_enabled" ? "Managed mode setting" :
                         "Hold to record setting";

      toast({
        title: "Success",
        description: `${settingName} saved successfully`,
      });

      await loadSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save setting: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    await updateSetting("openai_api_key", openaiKey, true);
    setLoading(false);
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

  const testOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    setTestingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-openai-key", {
        body: { apiKey: openaiKey }
      });

      if (error) throw error;

      if (data.valid) {
        toast({
          title: "Success",
          description: "OpenAI API key is valid!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid OpenAI API key",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to test API key: " + error.message,
        variant: "destructive",
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const maskedKey = openaiKey ? `${"*".repeat(Math.max(0, openaiKey.length - 4))}${openaiKey.slice(-4)}` : "";

  return (
    <MobileFrame>
      <div className="h-full bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-foreground" />
              <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToApp}
              className="h-8 w-8 text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* OpenAI API Key Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">OpenAI API Key</h2>
              <p className="text-sm text-muted-foreground">
                Required for translation and speech services
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="text-sm text-foreground">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showKey ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="bg-background text-foreground border-border pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveOpenAIKey} 
                  disabled={loading}
                  size="sm"
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button 
                  onClick={testOpenAIKey} 
                  disabled={testingKey} 
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-muted"
                >
                  {testingKey ? "Testing..." : "Test"}
                </Button>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <ThemeSettings />
          </div>

          {/* Wake Lock Settings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">Screen Wake Lock</h2>
              <p className="text-sm text-muted-foreground">
                Prevents device screen from sleeping during conversations
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="wake-lock" className="text-sm text-foreground">
                Enable Wake Lock
              </Label>
              <Switch
                id="wake-lock"
                checked={wakeLockEnabled}
                onCheckedChange={handleWakeLockToggle}
              />
            </div>
          </div>

          {/* Managed Mode Settings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">Managed Mode</h2>
              <p className="text-sm text-muted-foreground">
                AI-managed turn-taking system with visual indicators (Beta feature)
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="managed-mode" className="text-sm text-foreground">
                Enable Managed Mode
              </Label>
              <Switch
                id="managed-mode"
                checked={managedModeEnabled}
                onCheckedChange={handleManagedModeToggle}
              />
            </div>

            {/* Turn Indicator Color Setting */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Turn Indicator Color</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: "Green", value: "green", class: "bg-green-100" },
                  { name: "Blue", value: "blue", class: "bg-blue-100" },
                  { name: "Purple", value: "purple", class: "bg-purple-100" },
                  { name: "Yellow", value: "yellow", class: "bg-yellow-100" },
                  { name: "Pink", value: "pink", class: "bg-pink-100" },
                  { name: "Orange", value: "orange", class: "bg-orange-100" }
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting('turn_indicator_color', color.value)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      color.class,
                      "border-border hover:scale-110"
                    )}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Hold to Record Settings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">Recording Mode</h2>
              <p className="text-sm text-muted-foreground">
                Choose between tap-to-record or hold-to-record interaction
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="hold-to-record" className="text-sm text-foreground">
                Hold to Record Mode
              </Label>
              <Switch
                id="hold-to-record"
                checked={holdToRecordEnabled}
                onCheckedChange={handleHoldToRecordToggle}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-background space-y-3">
          <Button 
            onClick={onOpenDashboard}
            variant="default"
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Open Admin Dashboard
          </Button>
          
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full border-border text-foreground hover:bg-muted"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
};