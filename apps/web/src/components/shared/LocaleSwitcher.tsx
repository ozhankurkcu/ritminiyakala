'use client';

import { useTransition } from 'react';
import { setLocale } from '@/app/actions/locale';
import { type Locale } from '@/i18n/request';
import { cn } from '@/lib/utils';

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (locale: Locale) => {
    startTransition(async () => {
      await setLocale(locale);
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1" aria-label="Dil seçimi">
      {(['tr', 'en'] as Locale[]).map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          disabled={isPending || currentLocale === locale}
          className={cn(
            'px-2 py-1 rounded text-xs font-heading font-semibold uppercase transition-colors',
            currentLocale === locale
              ? 'bg-primary-700 text-white'
              : 'text-brand-fume hover:text-primary-700'
          )}
          aria-current={currentLocale === locale ? 'true' : undefined}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
