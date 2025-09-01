import { useCallback } from 'react';
import { logger } from '../services/loggingService';

interface UseLoggingReturn {
  logError: (message: string, data?: any, source?: string) => void;
  logWarn: (message: string, data?: any, source?: string) => void;
  logInfo: (message: string, data?: any, source?: string) => void;
  logDebug: (message: string, data?: any, source?: string) => void;
}

export const useLogging = (defaultSource?: string): UseLoggingReturn => {
  const logError = useCallback((message: string, data?: any, source?: string) => {
    logger.error(message, data, source || defaultSource);
  }, [defaultSource]);

  const logWarn = useCallback((message: string, data?: any, source?: string) => {
    logger.warn(message, data, source || defaultSource);
  }, [defaultSource]);

  const logInfo = useCallback((message: string, data?: any, source?: string) => {
    logger.info(message, data, source || defaultSource);
  }, [defaultSource]);

  const logDebug = useCallback((message: string, data?: any, source?: string) => {
    logger.debug(message, data, source || defaultSource);
  }, [defaultSource]);

  return {
    logError,
    logWarn,
    logInfo,
    logDebug,
  };
};

export default useLogging;
