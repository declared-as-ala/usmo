export type AppLanguage = 'en' | 'fr' | 'ar';

/** Picks the right value for the current language. Use for page-specific copy that isn't in AppContext's `t()` dictionary. */
export const tr = <T,>(language: AppLanguage, en: T, fr: T, ar: T): T => {
  if (language === 'fr') return fr;
  if (language === 'ar') return ar;
  return en;
};
