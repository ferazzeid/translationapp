import { useEffect } from 'react';
import { generateDynamicManifest, updateFaviconLinks } from '@/utils/manifestGenerator';

export const DynamicManifest = () => {
  useEffect(() => {
    const updateManifestAndIcons = async () => {
      try {
        // Generate dynamic manifest
        const manifest = await generateDynamicManifest();
        
        // Create blob URL for the manifest with cache busting
        const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
          type: 'application/json'
        });
        const manifestUrl = URL.createObjectURL(manifestBlob);
        
        // Remove existing manifest links to ensure clean override
        const existingLinks = document.querySelectorAll('link[rel="manifest"]');
        existingLinks.forEach(link => link.remove());
        
        // Create new manifest link with cache busting
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = `${manifestUrl}?v=${Date.now()}`;
        document.head.appendChild(manifestLink);
        
        // Also update page title immediately if available
        if (manifest.name && manifest.name !== 'TalkDuo') {
          document.title = manifest.name;
        }
        
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