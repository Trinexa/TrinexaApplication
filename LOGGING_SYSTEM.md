# Logging System Documentation

## Overview
The application now includes a comprehensive logging system that captures application events, errors, and debug information. Logs are stored in browser localStorage and can be viewed, filtered, and exported through the admin panel.

## Features
- **Multiple Log Levels**: Error, Warning, Info, and Debug
- **Automatic Storage**: Logs are saved to browser localStorage with daily rotation
- **Real-time Viewing**: Live log viewer with auto-refresh
- **Filtering**: Filter logs by level, date, or search terms
- **Export**: Download logs as text files for external analysis
- **Automatic Cleanup**: Old logs are cleaned up after 7 days
- **User Context**: Logs include user information when available

## Log Levels
- **ERROR (0)**: Critical errors that need immediate attention
- **WARN (1)**: Warning conditions that should be investigated
- **INFO (2)**: General information about application flow
- **DEBUG (3)**: Detailed information for debugging (only in development)

## Using the Logging System

### 1. Basic Usage with Hook
```typescript
import { useLogging } from '../hooks/useLogging';

const MyComponent = () => {
  const { logInfo, logWarn, logError, logDebug } = useLogging('MyComponent');
  
  const handleAction = () => {
    try {
      // Some operation
      logInfo('Action completed successfully');
    } catch (error) {
      logError('Action failed', error);
    }
  };
};
```

### 2. Direct Logger Usage
```typescript
import { logger } from '../services/loggingService';

// Simple logging
logger.info('User logged in', { userId: 123 });
logger.error('Database connection failed', error, 'DatabaseService');

// With additional data
logger.debug('API request', {
  url: '/api/users',
  method: 'GET',
  params: { page: 1 }
}, 'ApiService');
```

### 3. Component Integration Examples

#### Error Handling
```typescript
const handleSubmit = async (data) => {
  try {
    logInfo('Form submission started', { formData: data });
    await submitForm(data);
    logInfo('Form submitted successfully');
  } catch (error) {
    logError('Form submission failed', { error: error.message, formData: data });
  }
};
```

#### User Actions
```typescript
const handleLogin = async (credentials) => {
  logInfo('Login attempt started', { email: credentials.email });
  
  try {
    const user = await authenticate(credentials);
    logInfo('User authenticated successfully', { userId: user.id, email: user.email });
    return user;
  } catch (error) {
    logWarn('Authentication failed', { 
      email: credentials.email, 
      error: error.message 
    });
    throw error;
  }
};
```

#### Performance Monitoring
```typescript
const loadData = async () => {
  const startTime = Date.now();
  logDebug('Data loading started');
  
  try {
    const data = await fetchData();
    const loadTime = Date.now() - startTime;
    logInfo('Data loaded successfully', { 
      recordCount: data.length, 
      loadTimeMs: loadTime 
    });
    return data;
  } catch (error) {
    logError('Data loading failed', { 
      loadTimeMs: Date.now() - startTime,
      error: error.message 
    });
    throw error;
  }
};
```

## Admin Panel Log Viewer

### Accessing Logs
1. Navigate to Admin Panel → System Logs
2. The logs page provides real-time monitoring and historical log viewing

### Features
- **Live vs Stored**: Switch between real-time logs and stored daily logs
- **Date Selection**: View logs for specific dates
- **Level Filtering**: Filter by log level (Error, Warning, Info, Debug)
- **Search**: Text search across log messages and data
- **Export**: Download logs as text files
- **Auto-refresh**: Live logs refresh automatically every 5 seconds
- **Statistics**: View log counts by level

### Log Level Configuration
Admins can change the application log level:
- **Error Only**: Only critical errors
- **Warn+**: Warnings and errors
- **Info+**: Information, warnings, and errors
- **Debug (All)**: All log levels (recommended for development)

## Storage and Performance

### Browser Storage
- Logs are stored in browser localStorage
- Daily rotation with automatic cleanup
- Maximum 100 logs per day to prevent storage overflow
- Old logs automatically removed after 7 days

### Memory Management
- In-memory buffer keeps last 1000 logs for real-time viewing
- Automatic cleanup prevents memory leaks
- Efficient JSON serialization for storage

## Best Practices

### 1. Use Appropriate Log Levels
```typescript
// ✅ Good
logError('Payment processing failed', { orderId, error });
logWarn('API rate limit approaching', { remainingRequests: 10 });
logInfo('User profile updated', { userId });
logDebug('Cache hit', { key, ttl });

// ❌ Avoid
logError('User clicked button'); // Not an error
logDebug('Critical payment failure'); // Should be error level
```

### 2. Include Relevant Context
```typescript
// ✅ Good - includes useful context
logInfo('Form validation failed', {
  formName: 'userRegistration',
  errors: validationErrors,
  userId: currentUser?.id
});

// ❌ Less useful
logInfo('Validation failed');
```

### 3. Use Consistent Source Names
```typescript
// ✅ Good - consistent source naming
const { logInfo } = useLogging('UserService');
const { logError } = useLogging('PaymentComponent');

// ✅ Also good - manual source specification
logger.info('Cache cleared', cacheStats, 'CacheManager');
```

### 4. Don't Log Sensitive Information
```typescript
// ✅ Good
logInfo('User authenticated', { userId: user.id, email: user.email });

// ❌ Avoid
logInfo('User authenticated', { password: credentials.password });
```

## Examples in Current Codebase

### Navbar Component
```typescript
// Logo loading status
logInfo('Navbar rendered', { 
  loading, 
  settingsCount: settings ? Object.keys(settings).length : 0,
  logoUrl: logoUrl || 'not set'
});

// Error handling
logError('Logo failed to load', { logoUrl });
```

### HomePage Component
```typescript
// Data loading
logInfo('Fallback testimonials loaded', { count: testimonials.length });
logError('Failed to load fallback testimonials', err);
```

## Development vs Production

### Development Mode
- All log levels are active (DEBUG level)
- Console output is verbose
- Full error details are logged

### Production Mode
- Only INFO level and above by default
- Reduced console output
- Sensitive information is filtered

## Troubleshooting

### Common Issues
1. **Logs not appearing**: Check log level configuration
2. **Storage full**: Old logs may need manual cleanup
3. **Performance issues**: Reduce log level in production
4. **Missing logs**: Ensure logger is imported correctly

### Storage Cleanup
```typescript
// Manual cleanup of old logs
logger.clearOldLogs(3); // Keep only last 3 days

// Check storage usage
const logs = logger.getStoredLogs('2024-08-15');
console.log(`Logs for date: ${logs.length}`);
```

## Future Enhancements

Potential improvements for the logging system:
- Server-side log aggregation
- Log analysis and alerting
- Performance metrics integration
- Log shipping to external services
- Advanced filtering and querying
- Log retention policies by level

---

This logging system provides comprehensive monitoring capabilities while maintaining good performance and user experience. Use it to track application behavior, debug issues, and monitor system health.
