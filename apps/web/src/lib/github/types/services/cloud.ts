// src/lib/types/services/cloud.ts
export interface CloudConfig {
    provider: 'vercel' | 'aws' | 'gcp';
    region: string;
    credentials: CloudCredentials;
    resources: CloudResources;
  }
  
  export interface CloudCredentials {
    accessKeyId?: string;
    secretAccessKey?: string;
    token?: string;
  }
  
  export interface CloudResources {
    compute?: ComputeConfig;
    storage?: StorageConfig;
    cdn?: CDNConfig;
  }
  
  export interface ComputeConfig {
    type: string;
    size: string;
    autoscaling?: {
      min: number;
      max: number;
      targetCPUUtilization: number;
    };
  }
  
  export interface StorageConfig {
    type: 'blob' | 's3' | 'gcs';
    bucketName: string;
    privacy: 'public' | 'private';
  }
  
  export interface CDNConfig {
    enabled: boolean;
    domains?: string[];
    cachePolicy?: {
      defaultTTL: number;
      maxTTL: number;
      minTTL: number;
    };
  }