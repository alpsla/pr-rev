// src/lib/types/services/email.ts
export interface EmailServiceConfig {
    provider: 'sendgrid' | 'ses' | 'postmark';
    apiKey: string;
    fromEmail: string;
    templateDir?: string;
  }
  
  export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
  }
  
  export interface EmailQueue {
    priority: 'high' | 'normal' | 'low';
    retryAttempts: number;
    rateLimits?: {
      perSecond?: number;
      perMinute?: number;
      perHour?: number;
    };
  }