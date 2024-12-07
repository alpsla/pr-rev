const { PrismaClient } = require('@prisma/client')
const { UILanguage } = require('@prisma/client')

const prisma = new PrismaClient()

type TranslationValue = {
  en: string
  es: string
  fr: string
  de: string
  it: string
  pt: string
  ja: string
  ko: string
  zh_cn: string
  zh_tw: string
}

type TranslationCategory = {
  [key: string]: TranslationValue
}

type Translations = {
  common: TranslationCategory
  pr_review: TranslationCategory
}

const translations: Translations = {
  common: {
    submit: {
      en: 'Submit',
      es: 'Enviar',
      fr: 'Soumettre',
      de: 'Einreichen',
      it: 'Invia',
      pt: 'Enviar',
      ja: '送信',
      ko: '제출',
      zh_cn: '提交',
      zh_tw: '提交'
    },
    cancel: {
      en: 'Cancel',
      es: 'Cancelar',
      fr: 'Annuler',
      de: 'Abbrechen',
      it: 'Annulla',
      pt: 'Cancelar',
      ja: 'キャンセル',
      ko: '취소',
      zh_cn: '取消',
      zh_tw: '取消'
    }
  },
  pr_review: {
    analyze: {
      en: 'Analyze Pull Request',
      es: 'Analizar Pull Request',
      fr: 'Analyser la Pull Request',
      de: 'Pull Request analysieren',
      it: 'Analizza Pull Request',
      pt: 'Analisar Pull Request',
      ja: 'プルリクエストを分析',
      ko: '풀 리퀘스트 분석',
      zh_cn: '分析拉取请求',
      zh_tw: '分析拉取請求'
    }
  }
}

const languageMap: Record<string, keyof typeof UILanguage> = {
  'en': 'EN',
  'es': 'ES',
  'fr': 'FR',
  'de': 'DE',
  'it': 'IT',
  'pt': 'PT',
  'ja': 'JA',
  'ko': 'KO',
  'zh_cn': 'ZH_CN',
  'zh_tw': 'ZH_TW'
}

async function main() {
  // Clear existing data
  await prisma.localeSettings.deleteMany()
  
  // Insert translations
  for (const [category, categoryData] of Object.entries(translations)) {
    for (const [key, translationSet] of Object.entries(categoryData)) {
      for (const [lang, value] of Object.entries(translationSet)) {
        await prisma.localeSettings.create({
          data: {
            language: languageMap[lang],
            key: `${category}.${key}`,
            value: value,
            category: category,
            description: `Translation for ${category}.${key}`
          }
        })
      }
    }
  }
  
  console.log('Seed data inserted successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })