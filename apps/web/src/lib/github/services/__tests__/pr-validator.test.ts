import { PRValidator, PRValidationError } from '../pr-validator';

const mockGet = jest.fn();

jest.mock('@octokit/rest', () => {
  const MockOctokit = jest.fn().mockImplementation(() => ({
    pulls: { get: mockGet }
  }));
  return { Octokit: MockOctokit };
});

describe('PRValidator', () => {
  describe('parsePRUrl', () => {
    it('parses valid GitHub PR URLs', () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const result = PRValidator.parsePRUrl(url);
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        number: 123
      });
    });

    it('returns null for non-GitHub URLs', () => {
      const url = 'https://gitlab.com/owner/repo/pull/123';
      const result = PRValidator.parsePRUrl(url);
      expect(result).toBeNull();
    });

    it('returns null for invalid PR URLs', () => {
      const urls = [
        'https://github.com/owner/repo/pulls/123',
        'https://github.com/owner/repo/123',
        'https://github.com/owner/repo/pull/abc',
        'https://github.com/owner/pull/123',
        'not-a-url'
      ];

      urls.forEach(url => {
        const result = PRValidator.parsePRUrl(url);
        expect(result).toBeNull();
      });
    });
  });

  describe('validatePR', () => {
    let validator: PRValidator;

    beforeEach(() => {
      jest.clearAllMocks();
      validator = new PRValidator('mock-token');
    });

    it('validates an open PR successfully', async () => {
      mockGet.mockResolvedValue({
        data: { state: 'open' }
      });

      await expect(validator.validatePR('https://github.com/owner/repo/pull/123'))
        .resolves.toBeUndefined();

      expect(mockGet).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 123
      });
    });

    it('throws for invalid PR URL format', async () => {
      await expect(validator.validatePR('invalid-url'))
        .rejects
        .toThrow(new PRValidationError('Invalid PR URL format'));

      expect(mockGet).not.toHaveBeenCalled();
    });

    it('throws for closed PR', async () => {
      mockGet.mockResolvedValue({
        data: { state: 'closed' }
      });

      await expect(validator.validatePR('https://github.com/owner/repo/pull/123'))
        .rejects
        .toThrow(new PRValidationError('Pull request is not open'));
    });

    it('handles API errors correctly', async () => {
      const errorCases = [
        { status: 401, message: 'Invalid GitHub token' },
        { status: 403, message: 'Rate limit exceeded or access denied' },
        { status: 404, message: 'Pull request or repository not found' },
        { status: 500, message: 'Failed to validate PR' }
      ];

      for (const { status, message } of errorCases) {
        mockGet.mockRejectedValue({ status });

        await expect(validator.validatePR('https://github.com/owner/repo/pull/123'))
          .rejects
          .toThrow(new PRValidationError(message));
      }
    });

    it('handles unexpected errors', async () => {
      mockGet.mockRejectedValue(new Error('Unexpected error'));

      await expect(validator.validatePR('https://github.com/owner/repo/pull/123'))
        .rejects
        .toThrow(new PRValidationError('Failed to validate PR'));
    });
  });
});
