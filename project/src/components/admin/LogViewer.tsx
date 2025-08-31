import React, { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, Eye, Search, Calendar } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { logger, LogLevel, LogEntry } from '../../services/loggingService';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStoredLogs, setShowStoredLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const logLevels = [
    { value: 'all', label: 'All Levels', color: 'bg-gray-100' },
    { value: LogLevel.ERROR, label: 'Error', color: 'bg-red-100' },
    { value: LogLevel.WARN, label: 'Warning', color: 'bg-yellow-100' },
    { value: LogLevel.INFO, label: 'Info', color: 'bg-blue-100' },
    { value: LogLevel.DEBUG, label: 'Debug', color: 'bg-green-100' },
  ];

  const loadLogs = () => {
    const newLogs = showStoredLogs ? logger.getStoredLogs(selectedDate) : logger.getLogs();
    setLogs(newLogs);
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    loadLogs();
  }, [showStoredLogs, selectedDate]);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedLevel, searchTerm]);

  useEffect(() => {
    if (autoRefresh && !showStoredLogs) {
      const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, showStoredLogs]);

  const handleExportLogs = () => {
    logger.exportLogs(showStoredLogs ? selectedDate : undefined);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear old logs? This will remove logs older than 7 days.')) {
      logger.clearOldLogs();
      loadLogs();
    }
  };

  const getLogLevelStyle = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.ERROR:
        return 'text-red-800 bg-red-100 border-red-200';
      case LogLevel.WARN:
        return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case LogLevel.INFO:
        return 'text-blue-800 bg-blue-100 border-blue-200';
      case LogLevel.DEBUG:
        return 'text-green-800 bg-green-100 border-green-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
        <div className="flex gap-2">
          <Button
            onClick={loadLogs}
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={handleExportLogs}
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleClearLogs}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Old
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Log Source Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Source
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowStoredLogs(false)}
                size="sm"
                variant={!showStoredLogs ? 'primary' : 'outline'}
                className="flex-1"
              >
                <Eye className="w-3 h-3 mr-1" />
                Live
              </Button>
              <Button
                onClick={() => setShowStoredLogs(true)}
                size="sm"
                variant={showStoredLogs ? 'primary' : 'outline'}
                className="flex-1"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Stored
              </Button>
            </div>
          </div>

          {/* Date Selector (only for stored logs) */}
          {showStoredLogs && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {logLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Auto-refresh toggle for live logs */}
        {!showStoredLogs && (
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700">
              Auto-refresh every 5 seconds
            </label>
          </div>
        )}
      </Card>

      {/* Log Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {logLevels.slice(1).map(level => {
          const count = filteredLogs.filter(log => log.level === level.value).length;
          return (
            <Card key={level.value} className={`p-4 ${level.color}`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600">{level.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Logs Display */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {showStoredLogs ? `Stored Logs for ${selectedDate}` : 'Live Logs'}
          </h3>
          <span className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No logs found matching your criteria
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`p-3 border rounded-md ${getLogLevelStyle(log.level)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {LogLevel[log.level]}
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.source && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {log.source}
                        </span>
                      )}
                      {log.userId && (
                        <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                          User: {log.userId}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {log.message}
                    </div>
                    {log.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Additional data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default LogViewer;
