import { supabase } from '../lib/supabase';

export interface Asset {
  id: string;
  name: string;
  type: 'logo' | 'favicon' | 'image' | 'document';
  file_name: string;
  file_size: number;
  mime_type: string;
  base64_data: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AssetUpload {
  name: string;
  type: Asset['type'];
  file: File;
}

class AssetAPI {
  // Upload/Update an asset
  async uploadAsset(upload: AssetUpload): Promise<Asset> {
    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(upload.file);
      
      // Validate file size (5MB limit)
      if (upload.file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type based on asset type
      this.validateFileType(upload.file, upload.type);

      // Call the upsert function
      const { data, error } = await supabase.rpc('upsert_asset', {
        p_name: upload.name,
        p_type: upload.type,
        p_file_name: upload.file.name,
        p_file_size: upload.file.size,
        p_mime_type: upload.file.type,
        p_base64_data: base64Data
      });

      if (error) {
        console.error('Error uploading asset:', error);
        throw new Error(error.message || 'Failed to upload asset');
      }

      // Get the uploaded asset
      const asset = await this.getAssetById(data);
      if (!asset) {
        throw new Error('Failed to retrieve uploaded asset');
      }

      return asset;
    } catch (error) {
      console.error('Error in uploadAsset:', error);
      throw error;
    }
  }

  // Get asset by ID
  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching asset by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAssetById:', error);
      return null;
    }
  }

  // Get asset by type and name
  async getAssetByType(type: Asset['type'], name?: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase.rpc('get_asset_by_type', {
        asset_type: type,
        asset_name: name
      });

      if (error) {
        console.error('Error fetching asset by type:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getAssetByType:', error);
      return null;
    }
  }

  // Get all assets by type
  async getAssetsByType(type: Asset['type']): Promise<Asset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAssetsByType:', error);
      return [];
    }
  }

  // Delete an asset
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting asset:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAsset:', error);
      return false;
    }
  }

  // Get logo asset
  async getLogo(): Promise<string | null> {
    const asset = await this.getAssetByType('logo', 'company_logo');
    return asset?.base64_data || null;
  }

  // Get favicon asset
  async getFavicon(): Promise<string | null> {
    const asset = await this.getAssetByType('favicon', 'company_favicon');
    return asset?.base64_data || null;
  }

  // Upload logo
  async uploadLogo(file: File): Promise<Asset> {
    return this.uploadAsset({
      name: 'company_logo',
      type: 'logo',
      file
    });
  }

  // Upload favicon
  async uploadFavicon(file: File): Promise<Asset> {
    return this.uploadAsset({
      name: 'company_favicon',
      type: 'favicon',
      file
    });
  }

  // Convert file to base64 with mime type prefix
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  }

  // Validate file type based on asset type
  private validateFileType(file: File, assetType: Asset['type']): void {
    const allowedTypes: Record<Asset['type'], string[]> = {
      logo: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'],
      favicon: ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
      image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (!allowedTypes[assetType].includes(file.type)) {
      throw new Error(`Invalid file type for ${assetType}. Allowed types: ${allowedTypes[assetType].join(', ')}`);
    }
  }

  // Get asset data URL for display
  getAssetDataUrl(asset: Asset | null): string | null {
    if (!asset || !asset.base64_data) return null;
    
    // If it already has the data URL prefix, return as is
    if (asset.base64_data.startsWith('data:')) {
      return asset.base64_data;
    }
    
    // Otherwise, construct the data URL
    return `data:${asset.mime_type};base64,${asset.base64_data}`;
  }
}

export const assetAPI = new AssetAPI();
export default assetAPI;
