// src/lib/types/services/analytics/core.ts
import type { ServiceConfig } from '../shared';
import type { 
  UserTrackingConfig, 
  SystemTrackingConfig, 
  BusinessMetricsConfig 
} from './tracking';
import type { AnalyticsStorageConfig } from './storage';

export interface AnalyticsConfig extends ServiceConfig {
  tracking: {
    user: UserTrackingConfig;
    system: SystemTrackingConfig;
    business: BusinessMetricsConfig;
  };
  storage: AnalyticsStorageConfig;
}

export interface SessionTrackingConfig {
  duration: boolean;
  interactions: boolean;
  pageViews: boolean;
  performance: boolean;
}