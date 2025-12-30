import { metrics, Counter, Histogram } from '@opentelemetry/api';

const METER_NAME = 'advana-marketplace-frontend-metrics';

class MetricsService {
  private meter = metrics.getMeter(METER_NAME);
  
  // Custom counters
  public errorCounter: Counter;
  public interactionCounter: Counter;
  public processingDuration: Histogram;

  constructor() {
    this.errorCounter = this.meter.createCounter('frontend_errors_total', {
      description: 'Total number of frontend errors',
    });

    this.interactionCounter = this.meter.createCounter('user_interactions_total', {
      description: 'Total number of significant user interactions',
    });

    this.processingDuration = this.meter.createHistogram('frontend_processing_seconds', {
      description: 'Duration of frontend processing tasks',
    });
  }

  public recordError(type: string, component: string) {
    this.errorCounter.add(1, { type, component });
  }

  public recordInteraction(action: string, target: string) {
    this.interactionCounter.add(1, { action, target });
  }

  public recordDuration(name: string, durationMs: number) {
    this.processingDuration.record(durationMs / 1000, { task: name });
  }
}

export const metricsService = new MetricsService();