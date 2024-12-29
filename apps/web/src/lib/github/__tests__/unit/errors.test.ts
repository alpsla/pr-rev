import {
  GitHubError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  ServerError,
  ValidationError,
  ResourceConflictError,
} from '../../errors';

describe('GitHub Errors', () => {
  describe('GitHubError', () => {
    it('should extend Error', () => {
      const error = new GitHubError('test error');
      expect(error).toBeInstanceOf(Error);
    });

    it('should set message and name', () => {
      const error = new GitHubError('test error');
      expect(error.message).toBe('test error');
      expect(error.name).toBe('GitHubError');
    });

    it('should handle optional parameters', () => {
      const originalError = new Error('original');
      const context = { foo: 'bar' };
      const error = new GitHubError('test error', 418, originalError, context);

      expect(error.status).toBe(418);
      expect(error.originalError).toBe(originalError);
      expect(error.context).toBe(context);
    });
  });

  describe('NotFoundError', () => {
    it('should extend GitHubError', () => {
      const error = new NotFoundError('not found');
      expect(error).toBeInstanceOf(GitHubError);
    });

    it('should set correct status and name', () => {
      const error = new NotFoundError('not found');
      expect(error.status).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should handle optional parameters', () => {
      const originalError = new Error('original');
      const context = { foo: 'bar' };
      const error = new NotFoundError('not found', originalError, context);

      expect(error.originalError).toBe(originalError);
      expect(error.context).toBe(context);
    });
  });

  describe('AuthenticationError', () => {
    it('should extend GitHubError with correct status', () => {
      const error = new AuthenticationError('unauthorized');
      expect(error).toBeInstanceOf(GitHubError);
      expect(error.status).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('RateLimitError', () => {
    it('should extend GitHubError with correct status', () => {
      const error = new RateLimitError('too many requests');
      expect(error).toBeInstanceOf(GitHubError);
      expect(error.status).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('NetworkError', () => {
    it('should extend GitHubError with correct status', () => {
      const error = new NetworkError('network failure');
      expect(error).toBeInstanceOf(GitHubError);
      expect(error.status).toBe(0);
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('ServerError', () => {
    it('should extend GitHubError with correct status', () => {
      const error = new ServerError('internal error');
      expect(error).toBeInstanceOf(GitHubError);
      expect(error.status).toBe(500);
      expect(error.name).toBe('ServerError');
    });
  });

  describe('ValidationError', () => {
    it('should extend GitHubError with correct status', () => {
      const error = new ValidationError('invalid input');
      expect(error).toBeInstanceOf(GitHubError);
      expect(error.status).toBe(422);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ResourceConflictError', () => {
    it('should extend GitHubError with correct status', () => {
      const error = new ResourceConflictError('conflict');
      expect(error).toBeInstanceOf(GitHubError);
      expect(error.status).toBe(409);
      expect(error.name).toBe('ResourceConflictError');
    });
  });

  describe('Error inheritance chain', () => {
    it('should maintain proper instanceof relationships', () => {
      const errors = [
        new NotFoundError('not found'),
        new AuthenticationError('unauthorized'),
        new RateLimitError('rate limit'),
        new NetworkError('network'),
        new ServerError('server'),
        new ValidationError('validation'),
        new ResourceConflictError('conflict'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(GitHubError);
      });
    });
  });

  describe('Error message handling', () => {
    it('should preserve error messages through inheritance chain', () => {
      const message = 'test message';
      const errors = [
        new NotFoundError(message),
        new AuthenticationError(message),
        new RateLimitError(message),
        new NetworkError(message),
        new ServerError(message),
        new ValidationError(message),
        new ResourceConflictError(message),
      ];

      errors.forEach(error => {
        expect(error.message).toBe(message);
      });
    });
  });

  describe('Context handling', () => {
    it('should properly store and retrieve context data', () => {
      const context: Record<string, unknown> = { 
        requestId: '123',
        endpoint: '/api/test',
        params: { id: 456 } as { id: number }
      };

      const errors = [
        new NotFoundError('not found', null, context),
        new AuthenticationError('unauthorized', null, context),
        new RateLimitError('rate limit', null, context),
        new NetworkError('network', null, context),
        new ServerError('server', null, context),
        new ValidationError('validation', null, context),
        new ResourceConflictError('conflict', null, context),
      ];

      errors.forEach(error => {
        expect(error.context).toBe(context);
        expect(error.context?.requestId).toBe('123');
        expect(error.context?.endpoint).toBe('/api/test');
        expect((error.context?.params as { id: number })?.id).toBe(456);
      });
    });
  });
});
