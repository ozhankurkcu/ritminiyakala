'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',             label: 'Ana Sayfa',      icon: true  },
  { href: '/how-it-works', label: 'Nasıl Çalışır?', icon: false },
  { href: '/rules',        label: 'Genel Kurallar',  icon: false },
  { href: '/pricing',      label: 'Fiyatlandırma',   icon: false },
  { href: '/gdpr',         label: 'GDPR',            icon: false },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

export function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">

      {/* ════════════════════════════════
          DESKTOP LAYOUT  (md+)
          Row 1: Logo  |  Auth buttons
          Row 2: Nav pill links
          ════════════════════════════════ */}
      <div className="hidden sm:block">
        {/* Row 1 */}
        <div className="container-rny flex items-center justify-between" style={{ height: 'clamp(120px, 6.4vw + 68px, 150px)' }}>
          <Link href="/" className="no-underline relative z-0">
            <Image
              src="/logo.png"
              alt="ritminiyakala"
              height={150}
              width={750}
              style={{ height: 'clamp(120px, 6.4vw + 68px, 150px)', width: 'auto', marginBottom: '-20px' }}
              className="object-contain relative z-0"
            />
          </Link>

          <div className="flex items-center gap-3">
            {pathname !== '/' && (
              <Link href="/" title="Ana Sayfa" aria-label="Ana Sayfa"
                className="btn-outline btn-sm no-underline flex items-center justify-center px-2.5">
                <HomeIcon className="w-4 h-4" />
              </Link>
            )}
            <Link href="/login"  className="btn-outline btn-sm no-underline">Giriş Yap</Link>
            <Link href="/signup" className="btn-primary btn-sm no-underline text-white">Ücretsiz Başla</Link>
          </div>
        </div>

        {/* Row 2 — nav bar */}
        <div>
          <nav className="container-rny flex items-center justify-center gap-1 pt-1 pb-[15px]">
            {NAV_LINKS.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-heading font-semibold no-underline transition-colors
                    ${active ? 'bg-primary-50 text-primary-700' : 'text-brand-fume hover:bg-primary-50 hover:text-primary-700'}`}>
                  {icon && <HomeIcon className="w-4 h-4 shrink-0" />}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ════════════════════════════════
          MOBILE LAYOUT  (< md)
          Row 1: Logo only (full width)
          Row 2: [Ücretsiz Başla] [Giriş Yap] [☰ Menü]
          Dropdown: nav links
          ════════════════════════════════ */}
      <div className="sm:hidden">
        {/* Row 1 — logo only, centered */}
        <div className="flex justify-center px-4 pt-4 pb-0">
          <Link href="/" className="no-underline relative z-0">
            <Image
              src="/logo.png"
              alt="ritminiyakala"
              height={120}
              width={600}
              style={{ height: 96, width: 'auto', marginBottom: '-14px' }}
              className="object-contain relative z-0"
            />
          </Link>
        </div>

        {/* Row 2 — buttons */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-brand-border mt-3">
          <Link href="/signup"
            className="btn-secondary btn-sm no-underline text-white flex-1 text-center justify-center hover:bg-secondary-dark active:bg-secondary-dark whitespace-nowrap">
            Ücretsiz Başla
          </Link>
          <Link href="/login"
            className="btn-outline btn-sm no-underline flex-1 text-center justify-center whitespace-nowrap">
            Giriş Yap
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menü"
            className="btn-outline btn-sm gap-1.5 shrink-0"
          >
            {/* 3 çizgi veya ✕ */}
            <span className="flex flex-col justify-center gap-[4px] w-4">
              <span className={`block h-[2px] bg-current transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block h-[2px] bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[2px] bg-current transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </span>
          </button>
        </div>

        {/* Dropdown nav */}
        {menuOpen && (
          <nav className="border-t border-brand-border px-4 py-2 flex flex-col gap-0.5 bg-white">
            {NAV_LINKS.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-heading font-semibold no-underline transition-colors
                    ${active ? 'bg-primary-50 text-primary-700' : 'text-brand-fume hover:bg-primary-50 hover:text-primary-700'}`}>
                  {icon && <HomeIcon className="w-4 h-4 shrink-0" />}
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

    </div>
  );
}
