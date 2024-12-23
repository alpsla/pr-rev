// src/lib/types/services/shared.ts
export interface ServiceConfig {
    enabled: boolean;
    environment: 'development' | 'staging' | 'production';
    monitoring?: MonitoringConfig;
  }
  
  export interface MonitoringConfig {
    metrics: boolean;
    logging: boolean;
    alerts: boolean;
    errorTracking: boolean;
  }