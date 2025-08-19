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
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["openai_api_key"]);

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.setting_key === "openai_api_key") {
          setOpenaiKey(setting.setting_value || "");
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

      const settingName = "API key";

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

        <div className="flex-1 p-4 space-y-8 overflow-y-auto">
          {/* OpenAI API Key Settings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">OpenAI API Key</h2>
              <p className="text-sm text-muted-foreground">
                Configure your OpenAI API key for translation and TTS services
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {openaiKey && (
                <p className="text-xs text-muted-foreground">
                  Current: {maskedKey}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveOpenAIKey}
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? "Saving..." : "Save Key"}
                </Button>
                <Button
                  onClick={testOpenAIKey}
                  disabled={testingKey || !openaiKey}
                  variant="outline"
                  size="sm"
                >
                  {testingKey ? "Testing..." : "Test"}
                </Button>
              </div>
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
            className="w-full theme-button-outline hover:theme-button-outline-hover"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
};