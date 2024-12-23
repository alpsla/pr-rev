// src/lib/types/services/payment.ts
export interface PaymentServiceConfig {
    provider: 'stripe';
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  }
  
  export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    features: PlanFeature[];
    limits: PlanLimits;
  }
  
  export interface PlanFeature {
    name: string;
    included: boolean;
    limit?: number;
  }
  
  export interface PlanLimits {
    monthlyRequests: number;
    teamMembers: number;
    privateRepos: boolean;
    retentionDays: number;
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank_account';
    last4: string;
    expMonth?: number;
    expYear?: number;
  }