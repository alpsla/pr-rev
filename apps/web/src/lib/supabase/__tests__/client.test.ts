import { db } from '../client';
import { Database } from '../types';
import { PostgrestResponse, PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';

type Platform = Database['public']['Tables']['platforms']['Row'];
type PlatformInsert = Database['public']['Tables']['platforms']['Insert'];
type PlatformUpdate = Database['public']['Tables']['platforms']['Update'];

type Language = Database['public']['Tables']['programming_languages']['Row'];
type LanguageInsert = Database['public']['Tables']['programming_languages']['Insert'];
type LanguageUpdate = Database['public']['Tables']['programming_languages']['Update'];

// Helper functions to create properly typed responses
function createSuccessResponse<T>(data: T[]): PostgrestResponse<T[]> {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  } as PostgrestResponse<T[]>;
}

function createErrorResponse<T>(message: string): PostgrestResponse<T> {
  const error: PostgrestError = {
    message,
    details: '',
    hint: '',
    code: 'ERROR',
    name: 'PostgrestError',
  };
  return {
    data: null,
    error,
    count: null,
    status: 400,
    statusText: 'Error',
  } as PostgrestResponse<T>;
}

function createSingleSuccessResponse<T>(data: T): PostgrestSingleResponse<T> {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  } as PostgrestSingleResponse<T>;
}

function createSingleErrorResponse<T>(message: string): PostgrestSingleResponse<T> {
  const error: PostgrestError = {
    message,
    details: '',
    hint: '',
    code: 'ERROR',
    name: 'PostgrestError',
  };
  return {
    data: null,
    error,
    count: null,
    status: 400,
    statusText: 'Error',
  } as PostgrestSingleResponse<T>;
}

import {
  mockSupabaseClient,
  mockSelect,
  mockOrder,
  mockEq,
  mockSingle,
  mockInsert,
  mockUpdate,
  mockDelete,
} from './mocks/supabase';

jest.mock('@supabase/supabase-js');

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Platforms', () => {
    const mockPlatform: Platform = {
      id: '1',
      name: 'Test Platform',
      type: 'github',
      enabled: true,
      capabilities: {
        code_review: true,
        pull_requests: true,
        webhooks: true,
      },
      config: {
        api_version: 'v3',
        base_url: 'https://api.github.com',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    describe('getAll', () => {
      it('should fetch all platforms successfully', async () => {
        mockOrder.mockResolvedValue(
          createSuccessResponse<Platform>([mockPlatform])
        );

        const result = await db.platforms.getAll();

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockOrder).toHaveBeenCalledWith('name');
        expect(result).toEqual([mockPlatform]);
      });

      it('should throw error when fetch fails', async () => {
        mockOrder.mockResolvedValue(
          createErrorResponse<Platform[]>('DB error')
        );

        await expect(db.platforms.getAll()).rejects.toThrow('Failed to fetch platforms: DB error');
      });

      it('should throw error when no data returned', async () => {
        mockOrder.mockResolvedValue(
          createSuccessResponse<Platform>([])
        );

        await expect(db.platforms.getAll()).rejects.toThrow('Failed to fetch platforms: No data returned');
      });
    });

    describe('getById', () => {
      it('should fetch platform by id successfully', async () => {
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Platform>(mockPlatform)
        );

        const result = await db.platforms.getById('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('id', '1');
        expect(result).toEqual(mockPlatform);
      });

      it('should throw error when fetch fails', async () => {
        mockSingle.mockResolvedValue(
          createSingleErrorResponse<Platform>('DB error')
        );

        await expect(db.platforms.getById('1')).rejects.toThrow('Failed to fetch platform: DB error');
      });

      it('should throw error when no data returned', async () => {
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Platform | null>(null)
        );

        await expect(db.platforms.getById('1')).rejects.toThrow('Failed to fetch platform: No data returned');
      });
    });

    describe('create', () => {
      const newPlatform: PlatformInsert = {
        name: 'New Platform',
        type: 'github',
        enabled: true,
        capabilities: {
          code_review: true,
          pull_requests: true,
          webhooks: true,
        },
      };

      it('should create platform successfully', async () => {
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Platform>(mockPlatform)
        );

        const result = await db.platforms.create(newPlatform);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
        expect(mockInsert).toHaveBeenCalledWith(newPlatform);
        expect(result).toEqual(mockPlatform);
      });

      it('should throw error when creation fails', async () => {
        mockSingle.mockResolvedValue(
          createSingleErrorResponse<Platform>('DB error')
        );

        await expect(db.platforms.create(newPlatform)).rejects.toThrow('Failed to create platform: DB error');
      });
    });

    describe('update', () => {
      const updates: PlatformUpdate = {
        name: 'Updated Platform',
        enabled: false,
      };

      it('should update platform successfully', async () => {
        const updatedPlatform = { ...mockPlatform, ...updates };
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Platform>(updatedPlatform)
        );

        const result = await db.platforms.update('1', updates);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
        expect(mockUpdate).toHaveBeenCalledWith(updates);
        expect(mockEq).toHaveBeenCalledWith('id', '1');
        expect(result).toEqual(updatedPlatform);
      });

      it('should throw error when update fails', async () => {
        mockSingle.mockResolvedValue(
          createSingleErrorResponse<Platform>('DB error')
        );

        await expect(db.platforms.update('1', updates)).rejects.toThrow('Failed to update platform: DB error');
      });
    });

    describe('delete', () => {
      it('should delete platform successfully', async () => {
        mockEq.mockResolvedValue(
          createSuccessResponse<null>([])
        );

        await db.platforms.delete('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('id', '1');
      });

      it('should throw error when deletion fails', async () => {
        mockEq.mockResolvedValue(
          createErrorResponse<null>('DB error')
        );

        await expect(db.platforms.delete('1')).rejects.toThrow('Failed to delete platform: DB error');
      });
    });
  });

  describe('Programming Languages', () => {
    const mockLanguage: Language = {
      id: '1',
      name: 'Test Language',
      enabled: true,
      extensions: ['.ts', '.tsx'],
      analyzers: {
        eslint: true,
        prettier: true,
      },
      best_practices: {
        'no-console': 'error',
      },
      patterns: {
        'test-pattern': '^test.*$',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    describe('getAll', () => {
      it('should fetch all languages successfully', async () => {
        mockOrder.mockResolvedValue(
          createSuccessResponse<Language>([mockLanguage])
        );

        const result = await db.programmingLanguages.getAll();

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockOrder).toHaveBeenCalledWith('name');
        expect(result).toEqual([mockLanguage]);
      });

      it('should throw error when fetch fails', async () => {
        mockOrder.mockResolvedValue(
          createErrorResponse<Language[]>('DB error')
        );

        await expect(db.programmingLanguages.getAll()).rejects.toThrow('Failed to fetch programming languages: DB error');
      });
    });

    describe('getByName', () => {
      it('should fetch language by name successfully', async () => {
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Language>(mockLanguage)
        );

        const result = await db.programmingLanguages.getByName('Test Language');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('name', 'Test Language');
        expect(result).toEqual(mockLanguage);
      });

      it('should throw error when fetch fails', async () => {
        mockSingle.mockResolvedValue(
          createSingleErrorResponse<Language>('DB error')
        );

        await expect(db.programmingLanguages.getByName('Test Language')).rejects.toThrow(
          'Failed to fetch programming language: DB error'
        );
      });
    });

    describe('create', () => {
      const newLanguage: LanguageInsert = {
        name: 'New Language',
        enabled: true,
        extensions: ['.js', '.jsx'],
        analyzers: {
          eslint: true,
        },
      };

      it('should create language successfully', async () => {
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Language>(mockLanguage)
        );

        const result = await db.programmingLanguages.create(newLanguage);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
        expect(mockInsert).toHaveBeenCalledWith(newLanguage);
        expect(result).toEqual(mockLanguage);
      });

      it('should throw error when creation fails', async () => {
        mockSingle.mockResolvedValue(
          createSingleErrorResponse<Language>('DB error')
        );

        await expect(db.programmingLanguages.create(newLanguage)).rejects.toThrow(
          'Failed to create programming language: DB error'
        );
      });
    });

    describe('update', () => {
      const updates: LanguageUpdate = {
        enabled: false,
        extensions: ['.ts', '.tsx'],
      };

      it('should update language successfully', async () => {
        const updatedLanguage = { ...mockLanguage, ...updates };
        mockSingle.mockResolvedValue(
          createSingleSuccessResponse<Language>(updatedLanguage)
        );

        const result = await db.programmingLanguages.update('1', updates);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
        expect(mockUpdate).toHaveBeenCalledWith(updates);
        expect(mockEq).toHaveBeenCalledWith('id', '1');
        expect(result).toEqual(updatedLanguage);
      });

      it('should throw error when update fails', async () => {
        mockSingle.mockResolvedValue(
          createSingleErrorResponse<Language>('DB error')
        );

        await expect(db.programmingLanguages.update('1', updates)).rejects.toThrow(
          'Failed to update programming language: DB error'
        );
      });
    });

    describe('delete', () => {
      it('should delete language successfully', async () => {
        mockEq.mockResolvedValue(
          createSuccessResponse<null>([])
        );

        await db.programmingLanguages.delete('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('id', '1');
      });

      it('should throw error when deletion fails', async () => {
        mockEq.mockResolvedValue(
          createErrorResponse<null>('DB error')
        );

        await expect(db.programmingLanguages.delete('1')).rejects.toThrow(
          'Failed to delete programming language: DB error'
        );
      });
    });
  });
});
