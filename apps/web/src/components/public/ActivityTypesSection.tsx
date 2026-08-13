'use client';

import { useState } from 'react';
import Image from 'next/image';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ACTIVITY_TYPES, ACTIVITY_LABELS, ACTIVITY_ICONS } from '@/lib/constants';
import type { ActivityType } from '@/lib/constants';

type CustomType = { id: string; name: string; iconUrl: string | null };

export function ActivityTypesSection() {
  const [expanded,    setExpanded]    = useState(false);
  const [customTypes, setCustomTypes] = useState<CustomType[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [fetched,     setFetched]     = useState(false);

  const systemTypes = ACTIVITY_TYPES.filter((s) => s !== 'diger') as ActivityType[];

  const handleExpand = async () => {
    setExpanded(true);
    if (fetched) return;
    setLoading(true);
    try {
      const q    = query(
        collection(db, 'activities'),
        where('activityType', '==', 'custom'),
      );
      const snap = await getDocs(q);

      console.log('[ActivityTypesSection] snap.size:', snap.size);
      console.log('[ActivityTypesSection] docs:', snap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const seen  = new Set<string>();
      const types: CustomType[] = [];
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.customTypeStatus !== 'approved') return;
        const name = (data.customTypeName as string | undefined)?.trim();
        if (!name || seen.has(name)) return;
        seen.add(name);
        types.push({ id: d.id, name, iconUrl: (data.customTypeIconUrl as string) ?? null });
      });
      setCustomTypes(types);
    } catch (e) {
      console.error('[ActivityTypesSection]', e);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container-rny max-w-4xl mx-auto">
        <h2 className="font-heading text-2xl font-bold text-black text-center mb-2">
          Her Spor, Her Seviye
        </h2>
        <p className="text-brand-fume text-center mb-10">
          Hangi sporu seviyor olursan ol, seni bekleyen bir topluluk var.
        </p>

        {/* Sistem türleri */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[20px]">
          {systemTypes.map((sport) => (
            <div
              key={sport}
              className="flex flex-col items-center gap-0 bg-white border border-brand-border rounded-2xl py-0 hover:border-primary-300 hover:shadow-sm transition-all cursor-default overflow-hidden"
            >
              <Image
                src={ACTIVITY_ICONS[sport]}
                alt={ACTIVITY_LABELS[sport]}
                width={150}
                height={150}
                className="object-contain"
                style={{ marginBottom: '-15px', clipPath: 'inset(0 0 15px 0)' }}
              />
              <span className="text-sm font-heading font-semibold text-black text-center pb-[10px]">
                {ACTIVITY_LABELS[sport]}
              </span>
            </div>
          ))}
        </div>

        {/* Onaylanan özel türler */}
        {expanded && (
          <>
            {loading ? (
              <div className="flex justify-center mt-8">
                <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : customTypes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[20px] mt-[20px]">
                {customTypes.map((ct) => (
                  <div
                    key={ct.id}
                    className="flex flex-col items-center justify-center gap-2 bg-white border border-brand-border rounded-2xl py-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-default"
                  >
                    {ct.iconUrl ? (
                      <Image
                        src={ct.iconUrl}
                        alt={ct.name}
                        width={64}
                        height={64}
                        className="object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                        🏃
                      </div>
                    )}
                    <span className="text-sm font-heading font-semibold text-black text-center px-2">
                      {ct.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        {/* CTA */}
        <div className="flex justify-center mt-8">
          {!expanded ? (
            <button
              onClick={handleExpand}
              className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
            >
              Daha fazla aktivite türü
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2 text-sm font-medium text-brand-fume hover:text-black transition-colors"
            >
              Daha az göster
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
