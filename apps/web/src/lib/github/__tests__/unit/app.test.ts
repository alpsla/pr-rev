import { GitHubAppService } from '../../services/app';
import type { GitHubAppConfig } from '../../types/app';

// Mock declarations must come before jest.mock() calls
const mockOctokitInstance = {
  apps: {
    createInstallationAccessToken: jest.fn(),
    listInstallations: jest.fn(),
    getInstallation: jest.fn(),
    getRepoInstallation: jest.fn()
  }
};

// Mock modules
jest.mock('@octokit/rest', () => {
  const MockOctokit = jest.fn(() => mockOctokitInstance);
  Object.assign(global, { Octokit: MockOctokit });
  return { Octokit: MockOctokit };
});

jest.mock('@octokit/auth-app', () => ({
  createAppAuth: jest.fn()
}));

// Silence console output during tests
beforeAll(() => {
  jest.spyOn(console, 'debug').mockImplementation();
  jest.spyOn(console, 'info').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
  jest.spyOn(console, 'log').mockImplementation();
});

afterAll(() => {
  jest.restoreAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GitHubAppService', () => {
  const mockConfig: GitHubAppConfig = {
    appId: 'test-app-id',
    privateKey: 'test-private-key',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret'
  };

  const mockInstallationResponse = {
    id: 123,
    account: {
      login: 'test-user',
      id: 456,
      node_id: 'U_123',
      avatar_url: 'https://example.com/avatar.png',
      type: 'User'
    },
    app_id: 789,
    target_type: 'User',
    permissions: {
      issues: 'write',
      metadata: 'read'
    },
    events: ['push', 'pull_request'],
    repository_selection: 'all',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    single_file_name: null
  };

  const mockTokenResponse = {
    data: {
      token: 'test-token',
      expires_at: '2024-01-02T00:00:00Z',
      permissions: {
        issues: 'write',
        metadata: 'read'
      },
      repository_selection: 'all'
    }
  };

  let service: GitHubAppService;
  let mockOctokit: {
    apps: {
      createInstallationAccessToken: jest.Mock;
      listInstallations: jest.Mock;
      getInstallation: jest.Mock;
      getRepoInstallation: jest.Mock;
    };
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create new service instance
    service = new GitHubAppService(mockConfig);
    
    // Get the mocked Octokit instance
    mockOctokit = mockOctokitInstance;
  });

  describe('getInstallationToken', () => {
    it('should get installation token', async () => {
      mockOctokit.apps.createInstallationAccessToken.mockResolvedValueOnce(mockTokenResponse);

      const result = await service.getInstallationToken(123);

      expect(result).toEqual({
        token: 'test-token',
        expires_at: '2024-01-02T00:00:00Z',
        permissions: {
          issues: 'write',
          metadata: 'read'
        },
        repository_selection: 'all'
      });

      expect(mockOctokit.apps.createInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 123
      });
    });

    it('should handle errors getting token', async () => {
      mockOctokit.apps.createInstallationAccessToken.mockRejectedValueOnce(new Error('API error'));

      await expect(service.getInstallationToken(123))
        .rejects
        .toThrow('Failed to get installation token');
    });
  });

  describe('getInstallations', () => {
    it('should get all installations', async () => {
      mockOctokit.apps.listInstallations.mockResolvedValueOnce({
        data: [mockInstallationResponse]
      });

      const result = await service.getInstallations();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 123,
        account: {
          login: 'test-user',
          id: 456,
          avatar_url: 'https://example.com/avatar.png',
          type: 'User'
        },
        app_id: 789,
        target_type: 'User',
        permissions: {
          issues: 'write',
          metadata: 'read'
        },
        events: ['push', 'pull_request'],
        repository_selection: 'all',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        single_file_name: null
      });
    });

    it('should handle errors getting installations', async () => {
      mockOctokit.apps.listInstallations.mockRejectedValueOnce(new Error('API error'));

      await expect(service.getInstallations())
        .rejects
        .toThrow('Failed to get installations');
    });

    it('should handle missing account data', async () => {
      const invalidResponse = { ...mockInstallationResponse, account: null };
      mockOctokit.apps.listInstallations.mockResolvedValueOnce({
        data: [invalidResponse]
      });

      await expect(service.getInstallations())
        .rejects
        .toThrow('Failed to get installations');
    });
  });

  describe('getInstallation', () => {
    it('should get specific installation', async () => {
      mockOctokit.apps.getInstallation.mockResolvedValueOnce({
        data: mockInstallationResponse
      });

      const result = await service.getInstallation(123);

      expect(result).toEqual({
        id: 123,
        account: {
          login: 'test-user',
          id: 456,
          avatar_url: 'https://example.com/avatar.png',
          type: 'User'
        },
        app_id: 789,
        target_type: 'User',
        permissions: {
          issues: 'write',
          metadata: 'read'
        },
        events: ['push', 'pull_request'],
        repository_selection: 'all',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        single_file_name: null
      });

      expect(mockOctokit.apps.getInstallation).toHaveBeenCalledWith({
        installation_id: 123
      });
    });

    it('should handle errors getting installation', async () => {
      mockOctokit.apps.getInstallation.mockRejectedValueOnce(new Error('API error'));

      await expect(service.getInstallation(123))
        .rejects
        .toThrow('Failed to get installation');
    });
  });

  describe('getRepositoryInstallation', () => {
    it('should get repository installation', async () => {
      mockOctokit.apps.getRepoInstallation.mockResolvedValueOnce({
        data: mockInstallationResponse
      });

      const result = await service.getRepositoryInstallation('owner', 'repo');

      expect(result).toEqual({
        id: 123,
        account: {
          login: 'test-user',
          id: 456,
          avatar_url: 'https://example.com/avatar.png',
          type: 'User'
        },
        app_id: 789,
        target_type: 'User',
        permissions: {
          issues: 'write',
          metadata: 'read'
        },
        events: ['push', 'pull_request'],
        repository_selection: 'all',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        single_file_name: null
      });

      expect(mockOctokit.apps.getRepoInstallation).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo'
      });
    });

    it('should handle errors getting repository installation', async () => {
      mockOctokit.apps.getRepoInstallation.mockRejectedValueOnce(new Error('API error'));

      await expect(service.getRepositoryInstallation('owner', 'repo'))
        .rejects
        .toThrow('Failed to get repository installation');
    });
  });

  describe('createInstallationClient', () => {
    it('should create installation client', async () => {
      mockOctokit.apps.createInstallationAccessToken.mockResolvedValueOnce(mockTokenResponse);

      const client = await service.createInstallationClient(123);

      expect(client).toBeDefined();
      expect(global.Octokit).toHaveBeenCalledWith(expect.objectContaining({
        auth: 'test-token'
      }));
    });

    it('should handle errors creating client', async () => {
      mockOctokit.apps.createInstallationAccessToken.mockRejectedValueOnce(new Error('API error'));

      await expect(service.createInstallationClient(123))
        .rejects
        .toThrow('Failed to create installation client');
    });
  });

  describe('URL generation', () => {
    it('should generate app URL', () => {
      const url = service.getAppUrl();
      expect(url).toBe('https://github.com/apps/test-app-id');
    });

    it('should generate install URL without state', () => {
      const url = service.getInstallUrl();
      expect(url).toBe('https://github.com/apps/test-app-id/installations/new');
    });

    it('should generate install URL with state', () => {
      const url = service.getInstallUrl('test-state');
      expect(url).toBe('https://github.com/apps/test-app-id/installations/new?state=test-state');
    });
  });

  describe('Account type handling', () => {
    it('should handle organization account type', async () => {
      const orgInstallation = {
        ...mockInstallationResponse,
        account: {
          ...mockInstallationResponse.account,
          type: 'Organization'
        },
        target_type: 'Organization'
      };

      mockOctokit.apps.getInstallation.mockResolvedValueOnce({
        data: orgInstallation
      });

      const result = await service.getInstallation(123);

      expect(result.account.type).toBe('Organization');
      expect(result.target_type).toBe('Organization');
    });

    it('should default to User for unknown types', async () => {
      const unknownInstallation = {
        ...mockInstallationResponse,
        account: {
          ...mockInstallationResponse.account,
          type: 'Unknown'
        },
        target_type: 'Unknown'
      };

      mockOctokit.apps.getInstallation.mockResolvedValueOnce({
        data: unknownInstallation
      });

      const result = await service.getInstallation(123);

      expect(result.account.type).toBe('User');
      expect(result.target_type).toBe('User');
    });
  });
});
