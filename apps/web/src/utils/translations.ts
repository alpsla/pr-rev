import { prisma } from '@/prisma'
import { UILanguage } from '@prisma/client'

export type TranslationKey = 'common.submit' | 'common.cancel' | 'pr_review.analyze'

class TranslationManager {
  private static instance: TranslationManager
  private translations: Map<string, string> = new Map()
  private currentLanguage: UILanguage = 'EN'

  private constructor() {}

  static getInstance(): TranslationManager {
    if (!TranslationManager.instance) {
      TranslationManager.instance = new TranslationManager()
    }
    return TranslationManager.instance
  }

  async loadTranslations(language: UILanguage) {
    const translations = await prisma.localeSettings.findMany({
      where: { language }
    })

    this.translations.clear()
    translations.forEach(t => {
      this.translations.set(t.key, t.value)
    })
    this.currentLanguage = language
  }

  async setLanguage(language: UILanguage) {
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
import { useState, useEffect } from 'react'

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