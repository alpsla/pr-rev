import { useState, useEffect } from 'react'
import { prisma } from '../prisma';
import type { PrismaClient } from '@prisma/client';

type UILanguage = 'EN' | 'ES'

export type TranslationKey = 'common.submit' | 'common.cancel' | 'pr_review.analyze'

interface LocaleSettings {
  key: string;
  value: string;
  language: UILanguage;
}

interface PrismaClientWithLocale extends PrismaClient {
  localeSettings: {
    findMany: (args: { where: { language: UILanguage } }) => Promise<LocaleSettings[]>;
  }
}

export class TranslationManager {
  private static instance: TranslationManager | null = null;
  private translations: Map<string, string> = new Map()
  private currentLanguage: UILanguage = 'EN'
  private prismaClient: PrismaClientWithLocale

  private constructor() {
    this.prismaClient = prisma as PrismaClientWithLocale;
  }

  static getInstance(): TranslationManager {
    if (!TranslationManager.instance) {
      TranslationManager.instance = new TranslationManager()
    }
    return TranslationManager.instance
  }

  // For testing purposes
  static resetInstance(): void {
    TranslationManager.instance = null;
  }

  setPrismaClient(client: PrismaClientWithLocale): void {
    this.prismaClient = client;
  }

  async loadTranslations(language: UILanguage): Promise<void> {
    const translations = await this.prismaClient.localeSettings.findMany({
      where: { language }
    })

    this.translations.clear()
    translations.forEach(t => {
      this.translations.set(t.key, t.value)
    })
    this.currentLanguage = language
  }

  async setLanguage(language: UILanguage): Promise<void> {
    if (language !== this.currentLanguage) {
      await this.loadTranslations(language)
    }
  }

  t(key: TranslationKey, params?: Record<string, string>): string {
    const translation = this.translations.get(key) || key
    if (!params) return translation

    return Object.entries(params).reduce(
      (text, [key, value]) => text.replace(`{${key}}`, value),
      translation
    )
  }
}

export const translationManager = TranslationManager.getInstance()

// React hook for using translations
export function useTranslation() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    translationManager.loadTranslations('EN').then(() => {
      setIsLoading(false)
    })
  }, [])

  return {
    t: (key: TranslationKey, params?: Record<string, string>) => 
      translationManager.t(key, params),
    setLanguage: translationManager.setLanguage.bind(translationManager),
    isLoading
  }
}
