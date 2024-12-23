// src/lib/types/services/analytics/index.ts
// Core exports
export type {
    AnalyticsConfig,
    SessionTrackingConfig
  } from './core';
  
  // Tracking related exports
  export type {
    UserTrackingConfig,
    SystemTrackingConfig,
    BusinessMetricsConfig,
    ResourceUsageConfig,
    ErrorTrackingConfig,
    PRTrackingEvents,
    AuthTrackingEvents,
    FeatureTrackingEvents,
    APIMetricsConfig,
    DatabaseMetricsConfig,
    ServiceMetricsConfig
  } from './tracking';
  
  // Provider exports
  export type {
    DatadogConfig,
    DatadogDashboard,
    DatadogAlert,
    DatadogWidget,
    DatadogRequest,
    DashboardLayout,
    GrafanaConfig,
    GrafanaDatasource,
    MixpanelConfig,
    SentryConfig,
    SentryIntegration,
    ElasticsearchConfig,
    AnalyticsProviders
  } from './providers';
  
  // Storage exports
  export type {
    AnalyticsStorageConfig
  } from './storage';
  
  // Events exports - removed duplicate AnalyticsEvent
  export type {
    EventMetadata,
    EventQuery,
    EventFilter
  } from './events';