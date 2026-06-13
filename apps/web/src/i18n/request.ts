import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  const locale = locales.includes(localeCookie as Locale) ? (localeCookie as Locale) : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
