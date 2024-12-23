// src/lib/types/services/database.ts
export interface DatabaseConfig {
    type: 'postgres' | 'supabase';
    url: string;
    schema?: string;
    poolConfig?: ConnectionPoolConfig;
    replication?: ReplicationConfig;
  }
  
  export interface ConnectionPoolConfig {
    min: number;
    max: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }
  
  export interface ReplicationConfig {
    master: string;
    slaves: string[];
    selector?: 'random' | 'roundRobin' | 'leastConnections';
  }