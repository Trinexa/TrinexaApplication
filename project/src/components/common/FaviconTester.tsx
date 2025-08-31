import { useSystemSettings } from '../../contexts/SystemSettingsContext';

export const FaviconTester = () => {
  const { updateSetting, getSetting } = useSystemSettings();

  const testFavicons = [
    {
      name: 'Green Circle',
      url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%2310B981"/></svg>'
    },
    {
      name: 'Blue Square',
      url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" fill="%233B82F6"/></svg>'
    },
    {
      name: 'Red Triangle',
      url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="12,2 22,20 2,20" fill="%23EF4444"/></svg>'
    },
    {
      name: 'Purple Star',
      url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="%237C3AED"/></svg>'
    },
    {
      name: 'Clear Favicon',
      url: ''
    }
  ];

  const handleSetFavicon = async (url: string) => {
    try {
      await updateSetting('favicon_url', url);
      console.log('🧪 FaviconTester: Set favicon to:', url);
    } catch (error) {
      console.error('🧪 FaviconTester: Error setting favicon:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Favicon Tester</h3>
      <p className="text-sm text-gray-600 mb-4">
        Current favicon URL: {getSetting('favicon_url') || 'None set'}
      </p>
      <div className="space-y-2">
        {testFavicons.map((favicon, index) => (
          <button
            key={index}
            onClick={() => handleSetFavicon(favicon.url)}
            className="block w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-50"
          >
            {favicon.name}
          </button>
        ))}
      </div>
    </div>
  );
};
