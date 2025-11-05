/**
 * useTranslation Hook
 * Provides i18n functionality for English and Tamil locales
 */

import { useState, useEffect } from "react";
import type { Locale } from "@/types/mobile";
import enTranslations from "@/i18n/en.json";
import taTranslations from "@/i18n/ta.json";

type TranslationKey = string;
type Translations = typeof enTranslations;

interface UseTranslationReturn {
  t: (key: TranslationKey) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LOCALE_STORAGE_KEY = "tamil-mind-mate-locale";

export function useTranslation(): UseTranslationReturn {
  // Initialize from localStorage or default to English
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return (stored as Locale) || "en-GB";
  });

  const [translations, setTranslations] = useState<Translations>(() => {
    return locale === "ta-IN" ? taTranslations : enTranslations;
  });

  useEffect(() => {
    // Load translations based on locale
    const newTranslations = locale === "ta-IN" ? taTranslations : enTranslations;
    setTranslations(newTranslations);
    
    // Persist to localStorage
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const t = (key: TranslationKey): string => {
    // Navigate nested object using dot notation
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Key not found, return key itself as fallback
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  return { t, locale, setLocale };
}
