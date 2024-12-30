import { translationManager, useTranslation, TranslationManager } from '../translations';
import { renderHook, act } from '@testing-library/react';

// Mock prisma before importing
jest.mock('../../../prisma', () => {
  return {
    prisma: {
      localeSettings: {
        findMany: jest.fn()
      }
    }
  };
});

// Import the mock so we can use it in tests
const { prisma } = jest.requireMock('../../../prisma');

describe('TranslationManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset translations map and instance
    TranslationManager.resetInstance();
    // Get new instance and set mock client
    const instance = TranslationManager.getInstance();
    instance.setPrismaClient(prisma);
    // Set mock client on exported instance too
    translationManager.setPrismaClient(prisma);
  });

  describe('loadTranslations', () => {
    it('should load translations from database', async () => {
      const mockTranslations = [
        { key: 'common.submit', value: 'Submit', language: 'EN' },
        { key: 'common.cancel', value: 'Cancel', language: 'EN' }
      ];

      (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

      await translationManager.loadTranslations('EN');

      expect(prisma.localeSettings.findMany).toHaveBeenCalledWith({
        where: { language: 'EN' }
      });

      expect(translationManager.t('common.submit')).toBe('Submit');
      expect(translationManager.t('common.cancel')).toBe('Cancel');
    });

    it('should clear previous translations when loading new ones', async () => {
      const mockTranslationsEN = [
        { key: 'common.submit', value: 'Submit', language: 'EN' }
      ];
      const mockTranslationsES = [
        { key: 'common.submit', value: 'Enviar', language: 'ES' }
      ];

      (prisma.localeSettings.findMany as jest.Mock)
        .mockResolvedValueOnce(mockTranslationsEN)
        .mockResolvedValueOnce(mockTranslationsES);

      await translationManager.loadTranslations('EN');
      expect(translationManager.t('common.submit')).toBe('Submit');

      await translationManager.loadTranslations('ES');
      expect(translationManager.t('common.submit')).toBe('Enviar');
    });
  });

  describe('setLanguage', () => {
    beforeEach(() => {
      // Reset translations and mock
      TranslationManager.resetInstance();
      const instance = TranslationManager.getInstance();
      instance.setPrismaClient(prisma);
      translationManager.setPrismaClient(prisma);
      jest.clearAllMocks();
    });

    it('should not reload translations if language is the same', async () => {
      const mockTranslations = [
        { key: 'common.submit', value: 'Submit', language: 'EN' }
      ];
      (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

      // Load initial translations
      await translationManager.loadTranslations('EN');
      jest.clearAllMocks(); // Reset mock count after initial load

      // Now test setLanguage with same language
      await translationManager.setLanguage('EN');

      expect(prisma.localeSettings.findMany).not.toHaveBeenCalled();
    });

    it('should reload translations if language is different', async () => {
      const mockTranslationsEN = [
        { key: 'common.submit', value: 'Submit', language: 'EN' }
      ];
      const mockTranslationsES = [
        { key: 'common.submit', value: 'Enviar', language: 'ES' }
      ];

      (prisma.localeSettings.findMany as jest.Mock)
        .mockResolvedValueOnce(mockTranslationsEN)
        .mockResolvedValueOnce(mockTranslationsES);

      // Load initial translations
      await translationManager.loadTranslations('EN');
      jest.clearAllMocks(); // Reset mock count after initial load

      // Change language
      await translationManager.setLanguage('ES');

      expect(prisma.localeSettings.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.localeSettings.findMany).toHaveBeenCalledWith({ where: { language: 'ES' } });
    });
  });

  describe('t (translate)', () => {
    it('should return key if translation not found', () => {
      expect(translationManager.t('pr_review.analyze')).toBe('pr_review.analyze');
    });

    it('should handle parameter substitution', async () => {
      const mockTranslations = [
        { key: 'common.submit', value: 'Submit {count} items', language: 'EN' }
      ];

      (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

      await translationManager.loadTranslations('EN');

      expect(translationManager.t('common.submit', { count: '3' })).toBe('Submit 3 items');
    });

    it('should handle multiple parameter substitutions', async () => {
      const mockTranslations = [
        { key: 'common.submit', value: '{user} submitted {count} items', language: 'EN' }
      ];

      (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

      await translationManager.loadTranslations('EN');

      expect(translationManager.t('common.submit', { user: 'John', count: '3' }))
        .toBe('John submitted 3 items');
    });

    it('should handle missing parameters', async () => {
      const mockTranslations = [
        { key: 'common.submit', value: 'Submit {count} items', language: 'EN' }
      ];

      (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

      await translationManager.loadTranslations('EN');

      expect(translationManager.t('common.submit')).toBe('Submit {count} items');
    });
  });
});

describe('useTranslation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    TranslationManager.resetInstance();
    const instance = TranslationManager.getInstance();
    instance.setPrismaClient(prisma);
    translationManager.setPrismaClient(prisma);
  });

  it('should start with loading state', async () => {
    const mockTranslations = [
      { key: 'common.submit', value: 'Submit', language: 'EN' }
    ];
    (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

    const { result } = renderHook(() => useTranslation());
    expect(result.current.isLoading).toBe(true);
    
    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should load EN translations by default', async () => {
    const mockTranslations = [
      { key: 'common.submit', value: 'Submit', language: 'EN' }
    ];

    (prisma.localeSettings.findMany as jest.Mock).mockResolvedValue(mockTranslations);

    const { result } = renderHook(() => useTranslation());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.t('common.submit')).toBe('Submit');
  });

  it('should allow changing language', async () => {
    const mockTranslationsEN = [
      { key: 'common.submit', value: 'Submit', language: 'EN' }
    ];
    const mockTranslationsES = [
      { key: 'common.submit', value: 'Enviar', language: 'ES' }
    ];

    (prisma.localeSettings.findMany as jest.Mock)
      .mockResolvedValueOnce(mockTranslationsEN)
      .mockResolvedValueOnce(mockTranslationsES);

    const { result } = renderHook(() => useTranslation());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.t('common.submit')).toBe('Submit');

    // Change language
    await act(async () => {
      await result.current.setLanguage('ES');
    });

    expect(result.current.t('common.submit')).toBe('Enviar');
  });
});
