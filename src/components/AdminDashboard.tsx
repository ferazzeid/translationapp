import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Settings, Palette, X } from "lucide-react";
import { MobileFrame } from "./MobileFrame";
import { LandingPageSettings } from "./LandingPageSettings";

interface AdminDashboardProps {
  onBackToSettings: () => void;
}

export const AdminDashboard = ({ onBackToSettings }: AdminDashboardProps) => {
  const [appName, setAppName] = useState("Translation App");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [paidUserLimit, setPaidUserLimit] = useState("1000");
  const [trialUserLimit, setTrialUserLimit] = useState("100");
  const [savingPaidLimit, setSavingPaidLimit] = useState(false);
  const [savingTrialLimit, setSavingTrialLimit] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBrandingSettings();
    checkExistingKey();
    loadApiLimits();
  }, []);

  const checkExistingKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-openai-key');
      if (!error && data?.hasKey) {
        setHasExistingKey(true);
      }
    } catch (error) {
      console.log('No existing key found');
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

    setSavingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-openai-key', {
        body: { apiKey: openaiKey }
      });

      if (error) throw error;

      if (data?.isValid) {
        setHasExistingKey(true);
        setOpenaiKey("");
        toast({
          title: "Success",
          description: "OpenAI API key saved and validated successfully",
        });
      } else {
        toast({
          title: "Invalid Key",
          description: "The provided OpenAI API key is invalid",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save API key: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestOpenAIKey = async () => {
    setTestingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-openai-key');
      
      if (error) throw error;
      
      if (data?.isValid) {
        toast({
          title: "Key Valid",
          description: "OpenAI API key is working correctly",
        });
      } else {
        toast({
          title: "Key Invalid",
          description: "OpenAI API key validation failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: `Failed to test API key: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingKey(false);
    }
  };

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

  const loadApiLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["paid_user_api_limit", "trial_user_api_limit"]);

      if (error) throw error;

      data?.forEach((setting) => {
        switch (setting.setting_key) {
          case "paid_user_api_limit":
            setPaidUserLimit(setting.setting_value || "1000");
            break;
          case "trial_user_api_limit":
            setTrialUserLimit(setting.setting_value || "100");
            break;
        }
      });
    } catch (error: any) {
      console.error('Error loading API limits:', error);
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

  const uploadFile = async (file: File, fileType: 'logo' | 'favicon') => {
    try {
      const setUploading = fileType === 'logo' ? setUploadingLogo : setUploadingFavicon;
      setUploading(true);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileType}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('admin-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('admin-assets')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update the appropriate state
      if (fileType === 'logo') {
        setLogoUrl(publicUrl);
        await updateSetting("app_logo_url", publicUrl);
      } else {
        setFaviconUrl(publicUrl);
        await updateSetting("favicon_url", publicUrl);
      }

      toast({
        title: "Upload Successful",
        description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded and saved successfully!`,
      });

    } catch (error: any) {
      console.error(`Error uploading ${fileType}:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${fileType}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      const setUploading = fileType === 'logo' ? setUploadingLogo : setUploadingFavicon;
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, WEBP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadFile(file, fileType);
    
    // Reset the input
    event.target.value = '';
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

  const handleSavePaidUserLimit = async () => {
    if (!paidUserLimit.trim() || isNaN(Number(paidUserLimit)) || Number(paidUserLimit) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number for paid user API limit",
        variant: "destructive",
      });
      return;
    }

    setSavingPaidLimit(true);
    try {
      await updateSetting("paid_user_api_limit", paidUserLimit);
      toast({
        title: "Success",
        description: "Paid user API limit saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save paid user limit: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSavingPaidLimit(false);
    }
  };

  const handleSaveTrialUserLimit = async () => {
    if (!trialUserLimit.trim() || isNaN(Number(trialUserLimit)) || Number(trialUserLimit) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number for trial user API limit",
        variant: "destructive",
      });
      return;
    }

    setSavingTrialLimit(true);
    try {
      await updateSetting("trial_user_api_limit", trialUserLimit);
      toast({
        title: "Success",
        description: "Trial user API limit saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save trial user limit: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSavingTrialLimit(false);
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
          {/* OpenAI API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                OpenAI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder={hasExistingKey ? "••••••••••••••••••••••••••••••" : "sk-..."}
                      className="bg-background text-foreground border-border"
                      disabled={hasExistingKey}
                    />
                    {hasExistingKey && (
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <span className="text-xs text-muted-foreground">Key saved</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for translation and speech services. This key is securely encrypted.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  className="flex-1"
                  onClick={handleSaveOpenAIKey}
                  disabled={savingKey || hasExistingKey}
                >
                  {savingKey ? "Saving..." : hasExistingKey ? "Key Saved" : "Save API Key"}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleTestOpenAIKey}
                  disabled={testingKey || !hasExistingKey}
                >
                  {testingKey ? "Testing..." : "Test Key"}
                </Button>
              </div>
              
              {/* API Usage Limits */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="paid-user-limit">Paid User API Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="paid-user-limit"
                      type="number"
                      value={paidUserLimit}
                      onChange={(e) => setPaidUserLimit(e.target.value)}
                      placeholder="1000"
                      min="0"
                      className="bg-background text-foreground border-border flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={handleSavePaidUserLimit}
                      disabled={savingPaidLimit}
                      className="px-4"
                    >
                      {savingPaidLimit ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum number of API requests per month for paid users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trial-user-limit">Trial User API Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="trial-user-limit"
                      type="number"
                      value={trialUserLimit}
                      onChange={(e) => setTrialUserLimit(e.target.value)}
                      placeholder="100"
                      min="0"
                      className="bg-background text-foreground border-border flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={handleSaveTrialUserLimit}
                      disabled={savingTrialLimit}
                      className="px-4"
                    >
                      {savingTrialLimit ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum number of API requests during free trial period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <Label htmlFor="logo-url">Logo</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                      className="w-full"
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* URL Input */}
                  <div className="relative">
                    <Input
                      id="logo-url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or enter logo URL manually"
                      className="bg-background text-foreground border-border pr-8"
                    />
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoUrl("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image or enter a URL. Recommended size: 512x512px
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
                <Label htmlFor="favicon-url">Favicon</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div>
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      disabled={uploadingFavicon}
                      className="w-full"
                    >
                      {uploadingFavicon ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Favicon
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* URL Input */}
                  <div className="relative">
                    <Input
                      id="favicon-url"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="Or enter favicon URL manually"
                      className="bg-background text-foreground border-border pr-8"
                    />
                    {faviconUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFaviconUrl("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image or enter a URL. Recommended size: 32x32px or 64x64px PNG
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

          {/* Landing Page Settings */}
          <LandingPageSettings />

        </div>
      </div>
    </MobileFrame>
  );
};