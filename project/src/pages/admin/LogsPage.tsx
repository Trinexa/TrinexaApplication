import React from 'react';
import { FileText, Settings, Info } from 'lucide-react';
import LogViewer from '../../components/admin/LogViewer';
import Card from '../../components/common/Card';
import { logger, LogLevel } from '../../services/loggingService';

const LogsPage: React.FC = () => {
  const handleSetLogLevel = (level: LogLevel) => {
    logger.setLogLevel(level);
    logger.info('Log level updated from admin panel', { newLevel: LogLevel[level] }, 'LogsPage');
  };

  const currentLogLevel = logger.getLogLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-600">Monitor application logs and system activities</p>
          </div>
        </div>
      </div>

      {/* Log Level Control */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Log Level Configuration</h3>
              <p className="text-sm text-gray-600">
                Current log level: <strong>{LogLevel[currentLogLevel]}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSetLogLevel(LogLevel.ERROR)}
              className={`px-3 py-1 text-xs rounded ${
                currentLogLevel === LogLevel.ERROR
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Error Only
            </button>
            <button
              onClick={() => handleSetLogLevel(LogLevel.WARN)}
              className={`px-3 py-1 text-xs rounded ${
                currentLogLevel === LogLevel.WARN
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Warn+
            </button>
            <button
              onClick={() => handleSetLogLevel(LogLevel.INFO)}
              className={`px-3 py-1 text-xs rounded ${
                currentLogLevel === LogLevel.INFO
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Info+
            </button>
            <button
              onClick={() => handleSetLogLevel(LogLevel.DEBUG)}
              className={`px-3 py-1 text-xs rounded ${
                currentLogLevel === LogLevel.DEBUG
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Debug (All)
            </button>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About System Logs</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Live Logs:</strong> Real-time logs from current session</li>
              <li>• <strong>Stored Logs:</strong> Daily log files saved in browser storage</li>
              <li>• <strong>Auto-refresh:</strong> Live logs update automatically every 5 seconds</li>
              <li>• <strong>Export:</strong> Download logs as text files for external analysis</li>
              <li>• <strong>Retention:</strong> Old logs are automatically cleaned up after 7 days</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Log Viewer */}
      <LogViewer />
    </div>
  );
};

export default LogsPage;
