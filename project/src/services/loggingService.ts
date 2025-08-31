// Logging service for the application
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  userId?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private logLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // Set log level based on environment
    if (import.meta.env.DEV) {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.id || user.email;
      }
    } catch (error) {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private addToMemory(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private formatLogMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleString();
    const source = entry.source ? `[${entry.source}] ` : '';
    const userId = entry.userId ? `[User: ${entry.userId}] ` : '';
    const data = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
    
    return `[${timestamp}] ${levelName}: ${source}${userId}${entry.message}${data}`;
  }

  private logToConsole(entry: LogEntry): void {
    const message = this.formatLogMessage(entry);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.DEBUG:
        console.debug(message);
        break;
    }
  }

  // Public logging methods
  error(message: string, data?: any, source?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, source);
    this.addToMemory(entry);
    this.logToConsole(entry);
    this.saveToStorage(entry);
  }

  warn(message: string, data?: any, source?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, data, source);
    this.addToMemory(entry);
    this.logToConsole(entry);
    this.saveToStorage(entry);
  }

  info(message: string, data?: any, source?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, data, source);
    this.addToMemory(entry);
    this.logToConsole(entry);
    this.saveToStorage(entry);
  }

  debug(message: string, data?: any, source?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, source);
    this.addToMemory(entry);
    this.logToConsole(entry);
    this.saveToStorage(entry);
  }

  // Save logs to localStorage (since we can't write files in browser)
  private saveToStorage(entry: LogEntry): void {
    try {
      const storageKey = `app_logs_${new Date().toISOString().split('T')[0]}`; // Daily log files
      const existingLogs = localStorage.getItem(storageKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(entry);
      
      // Keep only last 100 logs per day to avoid storage overflow
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log to storage:', error);
    }
  }

  // Get logs from memory
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Get logs from storage for a specific date
  getStoredLogs(date?: string): LogEntry[] {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const storageKey = `app_logs_${targetDate}`;
      const storedLogs = localStorage.getItem(storageKey);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Failed to get stored logs:', error);
      return [];
    }
  }

  // Export logs as downloadable file
  exportLogs(date?: string): void {
    const logs = date ? this.getStoredLogs(date) : this.getLogs();
    const logText = logs.map(log => this.formatLogMessage(log)).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `app_logs_${date || new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Clear old logs
  clearOldLogs(daysToKeep: number = 7): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);
      const logKeys = keys.filter(key => key.startsWith('app_logs_'));
      
      logKeys.forEach(key => {
        const dateStr = key.replace('app_logs_', '');
        const logDate = new Date(dateStr);
        
        if (logDate < cutoffDate) {
          localStorage.removeItem(key);
          console.info(`Removed old log file: ${key}`);
        }
      });
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('Log level changed', { newLevel: LogLevel[level] }, 'LoggingService');
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// Create singleton instance
export const logger = new LoggingService();

// Initialize logging service
logger.info('Logging service initialized', { 
  logLevel: LogLevel[logger.getLogLevel()],
  environment: import.meta.env.MODE 
}, 'LoggingService');

// Clean up old logs on initialization
logger.clearOldLogs();

export default logger;
