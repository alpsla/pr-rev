import { mockSupabaseClient } from '../../src/lib/supabase/__tests__/mocks/supabase';
import { db } from '../../src/lib/supabase/client';
import { Database } from '../../src/lib/supabase/types';

type Tables = Database['public']['Tables'];

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}));

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Platforms', () => {
    const mockPlatforms: Tables['platforms']['Row'][] = [
      {
        id: 'e3aaa21e-f23d-41ad-98fc-cbd264772358',
        name: 'GitHub',
        type: 'GITHUB',
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
        created_at: '2024-12-25T13:01:42.116634+00:00',
        updated_at: '2024-12-25T13:01:42.116634+00:00',
      },
    ];

    it('should get all platforms', async () => {
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: () => Promise.resolve({ data: mockPlatforms, error: null }),
        }),
      });

      const result = await db.platforms.getAll();
      expect(result).toEqual(mockPlatforms);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
    });

    it('should get platform by ID', async () => {
      const mockPlatform = mockPlatforms[0];
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockPlatform, error: null }),
          }),
        }),
      });

      const result = await db.platforms.getById(mockPlatform.id);
      expect(result).toEqual(mockPlatform);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
    });

    it('should create platform', async () => {
      const newPlatform: Tables['platforms']['Insert'] = {
        name: 'Bitbucket',
        type: 'BITBUCKET',
        enabled: true,
        capabilities: {
          code_review: true,
          pull_requests: true,
          webhooks: true,
        },
        config: {
          api_version: 'v2',
        },
      };
      const mockPlatform = {
        ...newPlatform,
        id: '7d1e8f5a-9b2c-4a3d-8e7f-6c5d4e3b2a1c',
        created_at: '2024-12-25T13:01:42.116634+00:00',
        updated_at: '2024-12-25T13:01:42.116634+00:00',
      };

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockPlatform, error: null }),
          }),
        }),
      });

      const result = await db.platforms.create(newPlatform);
      expect(result).toEqual(mockPlatform);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
    });

    it('should update platform', async () => {
      const updates: Tables['platforms']['Update'] = {
        enabled: true,
        config: {
          api_version: 'v4',
        },
      };
      const mockPlatform = { ...mockPlatforms[0], ...updates };

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: mockPlatform, error: null }),
            }),
          }),
        }),
      });

      const result = await db.platforms.update(mockPlatform.id, updates);
      expect(result).toEqual(mockPlatform);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
    });

    it('should delete platform', async () => {
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      });

      await db.platforms.delete(mockPlatforms[0].id);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('platforms');
    });
  });

  describe('Programming Languages', () => {
    const mockLanguages: Tables['programming_languages']['Row'][] = [
      {
        id: '1598d94d-a52c-42f8-938e-56e349ffdecf',
        name: 'JavaScript',
        enabled: true,
        extensions: ['.js', '.jsx', '.mjs'],
        analyzers: {
          eslint: true,
          prettier: true,
        },
        best_practices: {
          error_handling: 'Always use try-catch with async operations',
          type_checking: 'Use TypeScript or JSDoc for type safety',
        },
        patterns: {
          async_await: 'Use async/await instead of callbacks',
          const_let: 'Prefer const over let when possible',
        },
        created_at: '2024-12-25T13:01:42.116634+00:00',
        updated_at: '2024-12-25T13:01:42.116634+00:00',
      },
    ];

    it('should get all programming languages', async () => {
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: () => ({
          order: () => Promise.resolve({ data: mockLanguages, error: null }),
        }),
      });

      const result = await db.programmingLanguages.getAll();
      expect(result).toEqual(mockLanguages);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
    });

    it('should get programming language by name', async () => {
      const mockLanguage = mockLanguages[0];
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockLanguage, error: null }),
          }),
        }),
      });

      const result = await db.programmingLanguages.getByName('JavaScript');
      expect(result).toEqual(mockLanguage);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
    });

    it('should create programming language', async () => {
      const newLanguage: Tables['programming_languages']['Insert'] = {
        name: 'Python',
        enabled: true,
        extensions: ['.py'],
        analyzers: {
          pylint: true,
          mypy: true,
          black: true,
        },
        best_practices: {
          docstrings: 'Document functions and classes with docstrings',
          pep8: 'Follow PEP 8 style guide',
        },
        patterns: {
          list_comprehension: 'Use list comprehensions when appropriate',
          type_hints: 'Use type hints for better code clarity',
        },
      };
      const mockLanguage = {
        ...newLanguage,
        id: 'c18d3573-187d-46c6-94b4-eefb45776463',
        created_at: '2024-12-25T13:01:42.116634+00:00',
        updated_at: '2024-12-25T13:01:42.116634+00:00',
      };

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockLanguage, error: null }),
          }),
        }),
      });

      const result = await db.programmingLanguages.create(newLanguage);
      expect(result).toEqual(mockLanguage);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
    });

    it('should update programming language', async () => {
      const updates: Tables['programming_languages']['Update'] = {
        enabled: false,
        analyzers: {
          eslint: false,
        },
      };
      const mockLanguage = { ...mockLanguages[0], ...updates };

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: mockLanguage, error: null }),
            }),
          }),
        }),
      });

      const result = await db.programmingLanguages.update(mockLanguage.id, updates);
      expect(result).toEqual(mockLanguage);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
    });

    it('should delete programming language', async () => {
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      });

      await db.programmingLanguages.delete(mockLanguages[0].id);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('programming_languages');
    });
  });
});
