import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date, locale = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  }).format(date);
}

export function formatTime(date: Date, locale = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    hour:   '2-digit',
    minute: '2-digit',
  }).format(date);
}
