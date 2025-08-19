import { supabase } from "@/integrations/supabase/client";

export interface PWAManifestData {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  orientation: string;
  theme_color: string;
  background_color: string;
  categories: string[];
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
}

export const generateDynamicManifest = async (): Promise<PWAManifestData> => {
  try {
    // Fetch admin settings for PWA configuration
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["app_name", "app_short_name", "app_description", "app_icon_192", "app_icon_512"]);

    if (error) {
      console.warn("Error fetching admin settings for manifest:", error);
    }

    // Create settings map
    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Generate manifest with admin settings or fallbacks
    const manifest: PWAManifestData = {
      name: settingsMap.app_name || "Translation Bridge",
      short_name: settingsMap.app_short_name || "TransBridge", 
      description: settingsMap.app_description || "Real-time translation app for seamless communication",
      start_url: "/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#1a1a2e",
      background_color: "#0f0f23",
      categories: ["productivity", "utilities"],
      icons: [
        {
          src: settingsMap.app_icon_192 || "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: settingsMap.app_icon_512 || "/icon-512.png", 
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    return manifest;
  } catch (error) {
    console.error("Error generating dynamic manifest:", error);
    
    // Return default manifest on error
    return {
      name: "Translation Bridge",
      short_name: "TransBridge",
      description: "Real-time translation app for seamless communication",
      start_url: "/",
      display: "standalone", 
      orientation: "portrait",
      theme_color: "#1a1a2e",
      background_color: "#0f0f23",
      categories: ["productivity", "utilities"],
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192", 
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png", 
          purpose: "any maskable"
        }
      ]
    };
  }
};

export const updateFaviconLinks = async () => {
  try {
    // Fetch admin settings for favicon
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["app_icon_192", "app_icon_512"]);

    if (error) {
      console.warn("Error fetching favicon settings:", error);
      return;
    }

    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Update favicon links
    const favicon192 = settingsMap.app_icon_192 || "/icon-192.png";
    const favicon512 = settingsMap.app_icon_512 || "/icon-512.png";

    // Update existing favicon links
    let favicon192Link = document.querySelector('link[sizes="192x192"]') as HTMLLinkElement;
    if (!favicon192Link) {
      favicon192Link = document.createElement('link');
      favicon192Link.rel = 'icon';
      favicon192Link.type = 'image/png';
      favicon192Link.setAttribute('sizes', '192x192');
      document.head.appendChild(favicon192Link);
    }
    favicon192Link.href = favicon192;

    let favicon512Link = document.querySelector('link[sizes="512x512"]') as HTMLLinkElement;
    if (!favicon512Link) {
      favicon512Link = document.createElement('link');
      favicon512Link.rel = 'icon';
      favicon512Link.type = 'image/png';
      favicon512Link.setAttribute('sizes', '512x512');
      document.head.appendChild(favicon512Link);
    }
    favicon512Link.href = favicon512;

    // Update apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = favicon192;

    console.log("Favicon links updated successfully");
  } catch (error) {
    console.error("Error updating favicon links:", error);
  }
};