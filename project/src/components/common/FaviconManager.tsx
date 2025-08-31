import { useEffect } from 'react';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

export const FaviconManager = () => {
  const { getSetting, loading, settings } = useSystemSettings();

  useEffect(() => {
    console.log('🎯 FaviconManager: Effect triggered, loading:', loading);
    console.log('🎯 FaviconManager: Current settings:', settings);
    
    if (loading) {
      console.log('🎯 FaviconManager: Still loading, skipping...');
      return;
    }

    const faviconUrl = getSetting('favicon_url');
    const logoUrl = getSetting('logo_url');
    
    console.log('🎯 FaviconManager: favicon_url:', faviconUrl);
    console.log('🎯 FaviconManager: logo_url:', logoUrl);
    
    // Use favicon_url if set, otherwise fall back to logo_url, then default
    // Create a simple default favicon as data URL if no other option is available
    const defaultFavicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310B981"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';
    const iconUrl = faviconUrl || logoUrl || defaultFavicon;
    
    console.log('🎯 FaviconManager: Final iconUrl selected:', iconUrl);
    
    try {
      // Remove existing favicon links
      const existingIcons = document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"]');
      console.log('🎯 FaviconManager: Removing', existingIcons.length, 'existing favicon links');
      existingIcons.forEach(icon => icon.remove());
      
      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      
      // Set appropriate type based on file extension
      if (iconUrl.endsWith('.ico')) {
        link.type = 'image/x-icon';
      } else if (iconUrl.endsWith('.png')) {
        link.type = 'image/png';
      } else if (iconUrl.endsWith('.svg')) {
        link.type = 'image/svg+xml';
      } else {
        link.type = 'image/x-icon'; // default
      }
      
      // Add cache-busting parameter to force browser refresh
      const cacheBuster = '?v=' + Date.now();
      link.href = iconUrl.startsWith('data:') ? iconUrl : iconUrl + cacheBuster;
      
      // Add to document head
      document.head.appendChild(link);
      console.log('🎯 FaviconManager: Added new favicon link:', link);
      
      // Also create a shortcut icon link for older browsers
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = iconUrl.startsWith('data:') ? iconUrl : iconUrl + cacheBuster;
      document.head.appendChild(shortcutLink);
      
      // Also update the title if company name is configured
      const companyName = getSetting('company_name', 'Trinexa');
      const tagline = getSetting('company_tagline', 'AI-Powered Solutions for the Future');
      const newTitle = `${companyName} - ${tagline}`;
      document.title = newTitle;
      
      console.log('🎯 FaviconManager: Updated title to:', newTitle);
      console.log('✅ FaviconManager: Successfully updated favicon and title');
    } catch (error) {
      console.error('❌ FaviconManager: Error updating favicon:', error);
    }
  }, [getSetting, loading, settings, settings?.favicon_url, settings?.logo_url]);

  return null; // This component doesn't render anything
};
