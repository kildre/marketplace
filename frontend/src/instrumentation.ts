import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { logs, metrics, trace } from '@opentelemetry/api';

// Configuration from environment variables
const OTLP_ENDPOINT = import.meta.env.VITE_OTLP_ENDPOINT || 'http://localhost:4318';
const SERVICE_NAME = 'advana-marketplace-frontend';
const SERVICE_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const initInstrumentation = () => {
  if (!import.meta.env.VITE_ENABLE_OTEL) {
    console.log('[OTEL] Instrumentation disabled');
    return;
  }

  console.log(`[OTEL] Initializing with endpoint: ${OTLP_ENDPOINT}`);

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
  });

  // 1. Tracing Setup
  const traceExporter = new OTLPTraceExporter({
    url: `${OTLP_ENDPOINT}/v1/traces`,
  });
  
  const tracerProvider = new WebTracerProvider({ resource });
  tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
  tracerProvider.register();

  // 2. Metrics Setup
  const metricExporter = new OTLPMetricExporter({
    url: `${OTLP_ENDPOINT}/v1/metrics`,
  });

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // Export every 10 seconds
      }),
    ],
  });
  
  // Set global meter provider
  metrics.setGlobalMeterProvider(meterProvider);

  // 3. Logs Setup
  const logExporter = new OTLPLogExporter({
    url: `${OTLP_ENDPOINT}/v1/logs`,
  });

  const loggerProvider = new LoggerProvider({ resource });
  loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
  
  // Set global logger provider
  logs.setGlobalLoggerProvider(loggerProvider);

  // 4. Auto-instrumentation
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation({
        eventNames: ['click', 'submit'],
      }),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          // Add your backend URL here to connect frontend traces to backend traces
          new RegExp(import.meta.env.VITE_API_BASE_URL || '.*'),
        ],
        clearTimingResources: true,
      }),
    ],
  });

  console.log('[OTEL] Frontend instrumentation started');
};