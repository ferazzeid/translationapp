import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Settings, X } from "lucide-react";
import { MobileFrame } from "./MobileFrame";

interface AdminSettingsProps {
  onBackToApp: () => void;
  onSignOut: () => void;
}

export const AdminSettings = ({ onBackToApp, onSignOut }: AdminSettingsProps) => {
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
        .select("setting_value")
        .eq("setting_key", "openai_api_key")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setOpenaiKey(data?.setting_value || "");
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase.rpc("set_admin_setting", {
        key_name: key,
        value: value,
        encrypted: true
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key saved successfully",
      });

      await loadSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save API key: " + error.message,
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
    await updateSetting("openai_api_key", openaiKey);
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
                {openaiKey && !showKey && (
                  <p className="text-xs text-muted-foreground">
                    Current: {maskedKey}
                  </p>
                )}
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
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-background">
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