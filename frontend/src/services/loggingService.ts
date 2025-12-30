import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const isDev = import.meta.env.DEV;

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class LoggingService {
  private logger = logs.getLogger('advana-marketplace-frontend-logger');

  private emitToOtel(level: LogLevel, message: string, attributes: Record<string, any> = {}) {
    // Map string levels to OTel SeverityNumbers
    const severityMap: Record<LogLevel, SeverityNumber> = {
      error: SeverityNumber.ERROR,
      warn: SeverityNumber.WARN,
      info: SeverityNumber.INFO,
      debug: SeverityNumber.DEBUG,
    };

    this.logger.emit({
      severityNumber: severityMap[level],
      severityText: level.toUpperCase(),
      body: message,
      attributes: {
        ...attributes,
        url: window.location.href,
      },
    });
  }

  public error(message: string, error?: any) {
    console.error(message, error);
    this.emitToOtel('error', message, { 
      stack: error?.stack,
      error_name: error?.name 
    });
  }

  public warn(message: string) {
    console.warn(message);
    this.emitToOtel('warn', message);
  }

  public info(message: string) {
    console.info(message);
    this.emitToOtel('info', message);
  }

  public debug(message: string) {
    if (isDev) {
      console.debug(message);
    }
    this.emitToOtel('debug', message);
  }
}

export const logger = new LoggingService();