// src/lib/types/services/analytics/tracking.ts

import type { SessionTrackingConfig } from './core';
export interface UserTrackingConfig {
    events: {
        pr: PRTrackingEvents;
        auth: AuthTrackingEvents;
        feature: FeatureTrackingEvents;
      };
      session: SessionTrackingConfig;
  }
  export interface PRTrackingEvents {
    submitted: boolean;
    analyzed: boolean;
    reviewed: boolean;
    duration: boolean;
    languages: boolean;
    size: boolean;
    complexity: boolean;
  }
  
  export interface AuthTrackingEvents {
    signIn: boolean;
    signOut: boolean;
    scopeChanges: boolean;
    failedAttempts: boolean;
  }
  
  export interface FeatureTrackingEvents {
    used: boolean;
    abandoned: boolean;
    duration: boolean;
    errors: boolean;
  }

  export interface SystemTrackingConfig {
    performance: {
      api: APIMetricsConfig;
      database: DatabaseMetricsConfig;
      services: ServiceMetricsConfig;
    };
    resources: ResourceUsageConfig;
    errors: ErrorTrackingConfig;
  }
  
  export interface ResourceUsageConfig {
    cpu: boolean;
    memory: boolean;
    disk: boolean;
    network: boolean;
  }
  
  export interface ErrorTrackingConfig {
    capture: boolean;
    sampling: number;
    ignorePatterns: string[];
    contextLines: number;
  }
  
  export interface BusinessMetricsConfig {
    usage: {
      activeUsers: boolean;
      totalPRs: boolean;
      averageProcessingTime: boolean;
    };
    engagement: {
      retentionRate: boolean;
      churnRate: boolean;
      featureAdoption: boolean;
    };
    cost: {
      computeUsage: boolean;
      apiCalls: boolean;
      storage: boolean;
    };
  }
  
  // Additional required interfaces
  export interface APIMetricsConfig {
    latency: boolean;
    rateLimit: boolean;
    errorRate: boolean;
    cached: boolean;
  }
  
  export interface DatabaseMetricsConfig {
    queryPerformance: boolean;
    connections: boolean;
    poolSize: boolean;
    locks: boolean;
  }
  
  export interface ServiceMetricsConfig {
    availability: boolean;
    responseTime: boolean;
    throughput: boolean;
    saturation: boolean;
  }