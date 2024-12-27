export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface PrismaEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  processedAt?: Date;
}
