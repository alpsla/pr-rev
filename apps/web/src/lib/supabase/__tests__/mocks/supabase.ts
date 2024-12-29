import { jest } from '@jest/globals';
import { Database } from '../../types';
import { PostgrestResponse, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

type Platform = Database['public']['Tables']['platforms']['Row'];
type Language = Database['public']['Tables']['programming_languages']['Row'];

// Default mock data
const defaultPlatform: Platform = {
  id: '1',
  name: 'Default Platform',
  type: 'github',
  enabled: true,
  capabilities: {
    code_review: true,
    pull_requests: true,
    webhooks: true,
  },
  config: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultLanguage: Language = {
  id: '1',
  name: 'TypeScript',
  enabled: true,
  extensions: ['.ts', '.tsx'],
  analyzers: {
    eslint: true,
    prettier: true,
  },
  best_practices: {},
  patterns: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock response types
type MockResponse<T> = {
  data: T;
  error: null;
  count: number | null;
  status: 200;
  statusText: 'OK';
};

// Mock functions
export const mockSingle = jest.fn(() => 
  Promise.resolve({
    data: defaultPlatform,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  }) as unknown as Promise<PostgrestSingleResponse<Platform | Language | null>>
);

export const mockOrder = jest.fn(() => 
  Promise.resolve({
    data: [defaultPlatform],
    error: null,
    count: 1,
    status: 200,
    statusText: 'OK',
  }) as unknown as Promise<PostgrestResponse<(Platform | Language)[]>>
);

// Mock chain
const mockChain = {
  single: () => mockSingle(),
  select: () => ({
    order: () => mockOrder(),
    eq: () => mockChain,
  }),
  order: () => mockOrder(),
  eq: () => mockChain,
} as const;

// Export mocks with type assertions
export const mockSelect = jest.fn(() => mockChain);
export const mockEq = jest.fn(() => mockChain);
export const mockInsert = jest.fn(() => ({ select: () => mockSelect() }));
export const mockUpdate = jest.fn(() => ({ eq: () => mockEq() }));
export const mockDelete = jest.fn(() => ({ eq: () => mockEq() }));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockSingle.mockClear();
  mockOrder.mockClear();
  mockSelect.mockClear();
  mockInsert.mockClear();
  mockUpdate.mockClear();
  mockDelete.mockClear();
});

// Create mock Supabase client
export const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }),
  auth: {
    getSession: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
  },
} as unknown as SupabaseClient<Database>;

// Mock the Supabase client module
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}));
