import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Settings, Palette } from "lucide-react";
import { MobileFrame } from "./MobileFrame";

interface AdminDashboardProps {
  onBackToSettings: () => void;
}

export const AdminDashboard = ({ onBackToSettings }: AdminDashboardProps) => {
  const [appName, setAppName] = useState("Translation App");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBrandingSettings();
  }, []);

  const loadBrandingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["app_name", "app_logo_url", "favicon_url"]);

      if (error) throw error;

      data?.forEach((setting) => {
        switch (setting.setting_key) {
          case "app_name":
            setAppName(setting.setting_value || "Translation App");
            break;
          case "app_logo_url":
            setLogoUrl(setting.setting_value || "");
            break;
          case "favicon_url":
            setFaviconUrl(setting.setting_value || "");
            break;
        }
      });
    } catch (error: any) {
      console.error('Error loading branding settings:', error);
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

      toast({
        title: "Success",
        description: "Setting saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save setting: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveBranding = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updateSetting("app_name", appName),
        updateSetting("app_logo_url", logoUrl),
        updateSetting("favicon_url", faviconUrl)
      ]);

      // Update the favicon in real-time if provided
      if (faviconUrl) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = faviconUrl;
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = faviconUrl;
          document.head.appendChild(newFavicon);
        }
      }

      // Update the page title if app name changed
      document.title = appName;

      toast({
        title: "Success",
        description: "Branding settings saved successfully! Favicon and title updated.",
      });
    } catch (error) {
      console.error('Error saving branding settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="h-full bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-foreground" />
              <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToSettings}
              className="h-8 w-8 text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* App Branding Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                App Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* App Name */}
              <div className="space-y-2">
                <Label htmlFor="app-name">App Name</Label>
                <Input
                  id="app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Enter app name"
                  className="bg-background text-foreground border-border"
                />
                <p className="text-xs text-muted-foreground">
                  This name will appear when users install the app on their device
                </p>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png or /path/to/logo.png"
                  className="bg-background text-foreground border-border"
                />
                <p className="text-xs text-muted-foreground">
                  URL or path to your app logo. Recommended size: 512x512px
                </p>
                {logoUrl && (
                  <div className="mt-2">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-contain border border-border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Favicon URL */}
              <div className="space-y-2">
                <Label htmlFor="favicon-url">Favicon URL</Label>
                <Input
                  id="favicon-url"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.png or /path/to/favicon.png"
                  className="bg-background text-foreground border-border"
                />
                <p className="text-xs text-muted-foreground">
                  URL or path to your favicon. Recommended size: 32x32px or 64x64px PNG
                </p>
                {faviconUrl && (
                  <div className="mt-2">
                    <img 
                      src={faviconUrl} 
                      alt="Favicon preview" 
                      className="w-8 h-8 object-contain border border-border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSaveBranding} 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Saving..." : "Save Branding Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Upload Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>To upload custom images:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Upload your logo and favicon files to your web server or use a service like Imgur, CloudFlare Images, etc.</li>
                <li>Copy the direct URL to the image file</li>
                <li>Paste the URL in the fields above</li>
                <li>Click "Save Branding Settings"</li>
              </ol>
              <p className="text-xs">
                Note: Make sure the URLs are publicly accessible and use HTTPS for security.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileFrame>
  );
};