// src/lib/types/services/analytics/events.ts
// Removed export of interface that might be causing circular dependency
export interface AnalyticsEvent {
    id: string;
    timestamp: string;
    type: string;
    source: 'user' | 'system' | 'service';
    data: Record<string, unknown>;
    metadata: EventMetadata;
  }
  
  export interface EventMetadata {
    userId?: string;
    sessionId?: string;
    environment: string;
    version: string;
    client: {
      os: string;
      browser: string;
      device: string;
    };
  }
  
  export interface EventQuery {
    timeRange: {
      start: string;
      end: string;
      interval?: string;
    };
    filters: EventFilter[];
    metrics: string[];
    groupBy?: string[];
  }
  
  export interface EventFilter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
    value: unknown;
  }