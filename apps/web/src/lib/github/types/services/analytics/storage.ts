export interface AnalyticsStorageConfig {
    type: 'timeseries' | 'document' | 'relational';
    retention: {
      raw: number;       // days
      aggregated: number; // days
    };
    aggregation: {
      intervals: ('minute' | 'hour' | 'day' | 'week' | 'month')[];
      enabled: boolean;
    };
  }