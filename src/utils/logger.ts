/**
 * Logger utility for consistent logging across the application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogStyles {
  [key: string]: string;
}

const styles: LogStyles = {
  info: 'background-image: linear-gradient(to right, #a8b8ff, #7928ca); color: #000; padding: 2px 4px; border-radius: 4px; font-weight: bold; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); border: 1px solid #7c3aed;',
  warn: 'background-image: linear-gradient(to right, #fde725, #f05323); color: #713f12; padding: 2px 4px; border-radius: 4px; font-weight: bold; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); border: 1px solid #eab308;',
  error:
    'background-image: linear-gradient(to right, #ff4e4e, #d10000); color: #fff; padding: 2px 4px; border-radius: 4px; font-weight: bold; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); border: 1px solid #dc2626;',
  debug:
    'background-image: linear-gradient(to right, #00f0ff, #007bff); color: #000; padding: 2px 4px; border-radius: 4px; font-weight: bold; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); border: 1px solid #34d399;',
};

/**
 * Client-side logger with colored console output
 */
export const clientLogger = {
  info: (component: string, message: string, data?: any) => {
    console.log(`%c[${component || 'CLIENT'}]%c ${message}`, styles.info, '', data || '');
  },

  warn: (component: string, message: string, data?: any) => {
    console.warn(`%c[${component || 'CLIENT'}]%c ${message}`, styles.warn, '', data || '');
  },

  error: (component: string, message: string, data?: any) => {
    console.error(`%c[${component || 'CLIENT'}]%c ${message}`, styles.error, '', data || '');
  },

  debug: (component: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c[${component || 'CLIENT'}]%c ${message}`, styles.debug, '', data || '');
    }
  },
};

/**
 * Server-side logger for Node.js environment
 */
export const serverLogger = {
  info: (component: string, message: string, data?: any) => {
    console.log(`\x1b[44m[SERVER:${component || ''}]\x1b[0m ${message}`, data || '');
  },

  warn: (component: string, message: string, data?: any) => {
    console.warn(`\x1b[43m[SERVER:${component || ''}]\x1b[0m ${message}`, data || '');
  },

  error: (component: string, message: string, data?: any) => {
    console.error(`\x1b[41m[SERVER:${component || ''}]\x1b[0m ${message}`, data || '');
  },

  debug: (component: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\x1b[42m[SERVER:${component || ''}]\x1b[0m ${message}`, data || '');
    }
  },
};
