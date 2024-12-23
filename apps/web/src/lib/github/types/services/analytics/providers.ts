// src/lib/types/services/analytics/providers.ts
export interface AnalyticsProviders {
    metrics: 'datadog' | 'newrelic' | 'grafana';
    business: 'mixpanel' | 'amplitude' | 'segment';
    logging: 'elasticsearch' | 'splunk' | 'sumo-logic';
    errors: 'sentry' | 'rollbar';
  }

  export interface DatadogDashboard {
    id: string;
    name: string;
    description?: string;
    widgets: DatadogWidget[];
    layout: DashboardLayout;
  }
  
  // Datadog Integration
  export interface DatadogConfig {
    apiKey: string;
    appKey: string;
    service: string;
    env: string;
    dashboards: DatadogDashboard[];
    alerts: DatadogAlert[];
  }
  
  export interface DatadogAlert {
    id: string;
    name: string;
    type: 'metric' | 'log' | 'event';
    query: string;
    message: string;
    tags: string[];
  }
  
  export interface DatadogWidget {
    definition: {
      type: string;
      requests: DatadogRequest[];
      title?: string;
    };
    layout?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
  
  export interface DatadogRequest {
    q: string;
    display_type?: string;
    style?: Record<string, unknown>;
  }
  
  export interface DashboardLayout {
    template_variables?: Array<{
      name: string;
      prefix?: string;
      default?: string;
    }>;
    layout_type: 'ordered' | 'free';
    is_read_only: boolean;
  }
  
  export interface GrafanaDatasource {
    name: string;
    type: 'prometheus' | 'elasticsearch' | 'postgres' | 'cloudwatch';
    url: string;
    access: 'proxy' | 'direct';
    basicAuth?: boolean;
    isDefault?: boolean;
    jsonData?: {
      timeInterval?: string;
      queryTimeout?: string;
      customQueryParameters?: string;
    };
    secureJsonData?: {
      apiKey?: string;
      basicAuthPassword?: string;
    };
  }
  
  // Grafana Integration
  export interface GrafanaConfig {
    url: string;
    apiKey: string;
    organizationId: string;
    defaultDashboardFolder: string;
    datasources: GrafanaDatasource[];
  }
  
  export interface SentryIntegration {
    name: string;
    enabled: boolean;
    config?: Record<string, unknown>;
  }

  // Mixpanel for Business Analytics
  export interface MixpanelConfig {
    projectToken: string;
    apiSecret: string;
    serviceName: string;
    trackingConfig: {
      persistentId: boolean;
      crossDomainTracking: boolean;
      cookieDomain: string;
    };
  }
  
  // Sentry for Error Tracking
  export interface SentryConfig {
    dsn: string;
    environment: string;
    release: string;
    tracesSampleRate: number;
    integrations: SentryIntegration[];
  }
  
  // ElasticSearch for Logging
  export interface ElasticsearchConfig {
    node: string;
    auth: {
      apiKey?: string;
      username?: string;
      password?: string;
    };
    indices: {
      patterns: string[];
      lifecycle: {
        enabled: boolean;
        maxAge: string;
      };
    };
  }