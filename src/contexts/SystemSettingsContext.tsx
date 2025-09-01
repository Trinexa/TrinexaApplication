import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, SystemSetting } from '../services/api';
import { assetAPI } from '../services/assetApi';

interface SystemSettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateMultipleSettings: (settings: Record<string, string>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  getSetting: (key: string, defaultValue?: string) => string;
  uploadLogo: (file: File) => Promise<void>;
  uploadFavicon: (file: File) => Promise<void>;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

interface SystemSettingsProviderProps {
  children: ReactNode;
}

export const SystemSettingsProvider: React.FC<SystemSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      console.log('🏗️ SystemSettingsProvider: Starting to load settings...');
      setLoading(true);
      const data = await api.systemSettings.getAll();
      console.log('📥 SystemSettingsProvider: Received data from API:', data);
      const settingsMap: Record<string, string> = {};
      
      data.forEach((setting: SystemSetting) => {
        settingsMap[setting.setting_key] = setting.setting_value || '';
      });

      // Load logo and favicon from assets table
      try {
        const logoAsset = await assetAPI.getLogo();
        const faviconAsset = await assetAPI.getFavicon();
        
        if (logoAsset) {
          settingsMap['logo_url'] = logoAsset;
        }
        if (faviconAsset) {
          settingsMap['favicon_url'] = faviconAsset;
        }
        
        console.log('📥 SystemSettingsProvider: Loaded assets - Logo:', !!logoAsset, 'Favicon:', !!faviconAsset);
      } catch (assetError) {
        console.warn('⚠️ SystemSettingsProvider: Error loading assets:', assetError);
      }
      
      console.log('📥 SystemSettingsProvider: Processed settings map:', settingsMap);
      setSettings(settingsMap);
    } catch (error) {
      console.error('❌ SystemSettingsProvider: Error loading settings:', error);
      // Set default settings if loading fails
      setSettings({
        company_name: 'Trinexa',
        company_tagline: 'Pioneering AI-powered solutions',
        logo_url: '',
        logo_alt_text: 'Trinexa Logo',
        favicon_url: '',
        primary_color: '#10B981',
        secondary_color: '#059669',
        contact_email: 'contact@trinexa.com',
        contact_phone: '+1 (555) 123-4567',
        contact_address: '123 Innovation Drive, Tech Valley, CA 94103',
        business_hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
        support_email: 'support@trinexa.com',
        social_twitter: '',
        social_facebook: '',
        social_linkedin: '',
        social_instagram: ''
      });
    } finally {
      setLoading(false);
      console.log('📥 SystemSettingsProvider: Finished loading settings, loading = false');
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await api.systemSettings.update(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const updateMultipleSettings = async (newSettings: Record<string, string>) => {
    try {
      await api.systemSettings.updateMultiple(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  const uploadLogo = async (file: File) => {
    try {
      console.log('🔄 SystemSettingsProvider: Uploading logo...');
      const asset = await assetAPI.uploadLogo(file);
      const logoUrl = assetAPI.getAssetDataUrl(asset);
      
      if (logoUrl) {
        setSettings(prev => ({ ...prev, logo_url: logoUrl }));
        console.log('✅ SystemSettingsProvider: Logo uploaded and updated');
      }
    } catch (error) {
      console.error('❌ SystemSettingsProvider: Error uploading logo:', error);
      throw error;
    }
  };

  const uploadFavicon = async (file: File) => {
    try {
      console.log('🔄 SystemSettingsProvider: Uploading favicon...');
      const asset = await assetAPI.uploadFavicon(file);
      const faviconUrl = assetAPI.getAssetDataUrl(asset);
      
      if (faviconUrl) {
        setSettings(prev => ({ ...prev, favicon_url: faviconUrl }));
        console.log('✅ SystemSettingsProvider: Favicon uploaded and updated');
      }
    } catch (error) {
      console.error('❌ SystemSettingsProvider: Error uploading favicon:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value: SystemSettingsContextType = {
    settings,
    loading,
    updateSetting,
    updateMultipleSettings,
    refreshSettings,
    getSetting,
    uploadLogo,
    uploadFavicon
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = (): SystemSettingsContextType => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};
