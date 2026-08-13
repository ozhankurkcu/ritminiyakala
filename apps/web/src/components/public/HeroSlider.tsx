'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Slide = {
  id: string;
  heading: string;
  highlight: string;
  sub: string;
  active: boolean;
  order: number;
};

type HeroConfig = {
  bgType: 'gradient' | 'color' | 'image';
  bgGradient: string;
  bgColor: string;
  bgImage: string;
  textColor: string;
  highlightColor: string;
  subTextColor: string;
  bottomText: string;
  intervalSeconds: number;
  slides: Slide[];
};

const DEFAULT: HeroConfig = {
  bgType: 'gradient',
  bgGradient: 'from-[#631C99] via-[#581C87] to-[#3d0f5e]',
  bgColor: '#631C99',
  bgImage: '',
  textColor: '#ffffff',
  highlightColor: '#60E1EB',
  subTextColor: 'rgba(255,255,255,0.8)',
  bottomText: 'Kredi kartı gerekmez · Anında başla',
  intervalSeconds: 8,
  slides: [
    { id: '1', heading: 'Sporun Ritmini', highlight: 'Birlikte Yakala', sub: 'Yakınındaki spor aktivitelerini keşfet, yeni spor arkadaşları bul, kendi aktiviteni oluştur. Tüm sporlar, tek platform.', active: true, order: 0 },
  ],
};

function buildBgStyle(cfg: HeroConfig): React.CSSProperties {
  if (cfg.bgType === 'color')  return { background: cfg.bgColor };
  if (cfg.bgType === 'image')  return { backgroundImage: `url(${cfg.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  return {};
}

function buildBgClass(cfg: HeroConfig): string {
  if (cfg.bgType === 'gradient') return `bg-gradient-to-br ${cfg.bgGradient}`;
  return '';
}

export function HeroSlider() {
  const [config,  setConfig]  = useState<HeroConfig>(DEFAULT);
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    fetch('/api/hero').then((r) => r.json()).then((data: HeroConfig) => {
      setConfig(data);
      setCurrent(0);
    }).catch(() => {});
  }, []);

  const activeSlides = [...config.slides]
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const ms = (config.intervalSeconds ?? 8) * 1000;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % activeSlides.length);
        setFading(false);
      }, 400);
    }, ms);
    return () => clearInterval(timer);
  }, [activeSlides.length, config.intervalSeconds]);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 400);
  };

  const slide = activeSlides[current] ?? activeSlides[0];
  if (!slide) return null;

  return (
    <section
      className={`text-white pt-[75px] pb-[36px] px-4 ${buildBgClass(config)}`}
      style={buildBgStyle(config)}
    >
      <div className="container-rny text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-heading font-semibold px-4 py-1.5 rounded-full mb-6">
          🎉 Beta — Ücretsiz Başla
        </div>

        {/* Slogan */}
        <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold leading-tight mb-5"
            style={{ color: config.textColor }}>
            {slide.heading}<br />
            <span style={{ color: config.highlightColor }}>{slide.highlight}</span>
          </h1>
          <p className="text-lg font-body mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ color: config.subTextColor }}>
            {slide.sub}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup"
            className="btn-secondary btn-lg no-underline text-white inline-flex items-center justify-center">
            Ücretsiz Başla
          </Link>
          <Link href="/login"
            className="btn-lg no-underline inline-flex items-center justify-center border-2 border-white/40 text-white rounded-lg hover:bg-white/10 transition-colors px-6">
            Giriş Yap →
          </Link>
        </div>

        {config.bottomText && (
          <p className="text-sm mt-5" style={{ color: config.subTextColor }}>
            {config.bottomText}
          </p>
        )}

        {/* Dot indikatörleri */}
        {activeSlides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-[15px]">
            {activeSlides.map((_, idx) => (
              <button key={idx} onClick={() => goTo(idx)} aria-label={`Slayt ${idx + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  idx === current ? 'w-6 h-2 bg-accent' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
