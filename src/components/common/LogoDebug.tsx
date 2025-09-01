import React from 'react';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

const LogoDebug: React.FC = () => {
  const { getSetting, settings, loading } = useSystemSettings();
  const logoUrl = getSetting('logo_url');

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-red-600 mb-2">Logo Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Logo URL:</strong> {logoUrl || 'Not set'}</div>
        <div><strong>Settings Count:</strong> {Object.keys(settings).length}</div>
        <div><strong>All Settings:</strong></div>
        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-y-auto">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LogoDebug;
