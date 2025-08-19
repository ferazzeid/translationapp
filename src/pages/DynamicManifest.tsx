import { useEffect } from 'react';
import { generateDynamicManifest, updateFaviconLinks } from '@/utils/manifestGenerator';

export const DynamicManifest = () => {
  useEffect(() => {
    const updateManifestAndIcons = async () => {
      try {
        // Generate dynamic manifest
        const manifest = await generateDynamicManifest();
        
        // Create blob URL for the manifest
        const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
          type: 'application/json'
        });
        const manifestUrl = URL.createObjectURL(manifestBlob);
        
        // Update manifest link
        let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (!manifestLink) {
          manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          document.head.appendChild(manifestLink);
        }
        
        // Clean up previous blob URL
        if (manifestLink.href.startsWith('blob:')) {
          URL.revokeObjectURL(manifestLink.href);
        }
        
        manifestLink.href = manifestUrl;
        
        // Update favicon links
        await updateFaviconLinks();
        
        console.log('Dynamic manifest and favicons updated successfully');
      } catch (error) {
        console.error('Error updating dynamic manifest:', error);
      }
    };

    updateManifestAndIcons();
    
    // Listen for changes in admin settings to update manifest
    const interval = setInterval(updateManifestAndIcons, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything
};