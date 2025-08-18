import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Settings, Key, Volume2, Users } from "lucide-react";

interface AdminSettingsProps {
  onBackToApp: () => void;
  onSignOut: () => void;
}

interface AdminSetting {
  setting_key: string;
  setting_value: string | null;
  description: string;
}

export const AdminSettings = ({ onBackToApp, onSignOut }: AdminSettingsProps) => {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [openaiKey, setOpenaiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [voiceModel, setVoiceModel] = useState("alloy");
  const [voiceSpeed, setVoiceSpeed] = useState("1.0");
  const { toast } = useToast();

  const voiceOptions = [
    { value: "alloy", label: "Alloy (Neutral)" },
    { value: "echo", label: "Echo (Masculine)" },
    { value: "fable", label: "Fable (British)" },
    { value: "onyx", label: "Onyx (Deep)" },
    { value: "nova", label: "Nova (Young)" },
    { value: "shimmer", label: "Shimmer (Soft)" },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value, description")
        .order("setting_key");

      if (error) throw error;

      setSettings(data || []);
      
      // Set individual state values
      const keyData = data?.find(s => s.setting_key === "openai_api_key");
      const voiceData = data?.find(s => s.setting_key === "voice_model");
      const speedData = data?.find(s => s.setting_key === "voice_speed");
      
      setOpenaiKey(keyData?.setting_value || "");
      setVoiceModel(voiceData?.setting_value || "alloy");
      setVoiceSpeed(speedData?.setting_value || "1.0");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load settings: " + error.message,
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase.rpc("set_admin_setting", {
        key_name: key,
        value: value,
        encrypted: key === "openai_api_key"
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });

      await loadSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update setting: " + error.message,
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
    <div className="min-h-screen bg-gradient-surface p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure your translation app settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBackToApp}>
              Back to App
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Settings
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>OpenAI API Configuration</CardTitle>
                <CardDescription>
                  Configure your OpenAI API key for translation and text-to-speech services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="openai-key"
                        type={showKey ? "text" : "password"}
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        placeholder="sk-..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={testOpenAIKey} disabled={testingKey} variant="outline">
                      {testingKey ? "Testing..." : "Test Key"}
                    </Button>
                  </div>
                  {openaiKey && !showKey && (
                    <p className="text-sm text-muted-foreground">
                      Current key: {maskedKey}
                    </p>
                  )}
                </div>
                <Button onClick={handleSaveOpenAIKey} disabled={loading}>
                  {loading ? "Saving..." : "Save API Key"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle>Voice Configuration</CardTitle>
                <CardDescription>
                  Configure text-to-speech settings for translations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voice-model">Voice Model</Label>
                  <Select value={voiceModel} onValueChange={setVoiceModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voice-speed">Voice Speed</Label>
                  <Select value={voiceSpeed} onValueChange={setVoiceSpeed}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                      <SelectItem value="2.0">2.0x (Very Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => updateSetting("voice_model", voiceModel)}>
                    Save Voice Model
                  </Button>
                  <Button onClick={() => updateSetting("voice_speed", voiceSpeed)} variant="outline">
                    Save Speed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    General settings coming soon...
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Settings</h4>
                    <div className="grid gap-2 text-sm">
                      {settings.map((setting) => (
                        <div key={setting.setting_key} className="flex justify-between">
                          <span className="text-muted-foreground">{setting.setting_key}:</span>
                          <span className="font-mono">
                            {setting.setting_key === "openai_api_key" && setting.setting_value
                              ? `${"*".repeat(Math.max(0, setting.setting_value.length - 4))}${setting.setting_value.slice(-4)}`
                              : setting.setting_value || "Not set"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};