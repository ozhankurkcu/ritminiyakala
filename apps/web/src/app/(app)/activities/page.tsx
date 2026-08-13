'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { activityService } from '@/modules/activity/activityService';
import {
  ACTIVITY_TYPES, ACTIVITY_LABELS,
  ACTIVITY_CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS,
  type ActivityType, type ActivityCategory,
} from '@/lib/constants';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import { getUserLocation, haversineDistance } from '@/lib/geocoding';
import type { Activity } from '@/types';

const ActivityMap = dynamic(
  () => import('@/components/map/ActivityMap').then((m) => m.ActivityMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div> },
);

type ViewMode = 'list' | 'map';

const RADIUS_OPTIONS = [5, 10, 25, 50, 0] as const;
const RADIUS_LABELS: Record<number, string> = { 5: '5 km', 10: '10 km', 25: '25 km', 50: '50 km', 0: 'Tümü' };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export default function ActivitiesPage() {
  const [activities,    setActivities]    = useState<Activity[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [viewMode,      setViewMode]      = useState<ViewMode>('list');
  const [sportFilter,     setSportFilter]     = useState<ActivityType | undefined>(undefined);
  const [categoryFilter,  setCategoryFilter]  = useState<ActivityCategory | undefined>(undefined);
  const [radiusKm,      setRadiusKm]      = useState<number>(0);
  const [search,        setSearch]        = useState('');
  const [userLocation,  setUserLocation]  = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading,    setLocLoading]    = useState(false);

  useEffect(() => {
    activityService.listActivities()
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const requestLocation = async () => {
    setLocLoading(true);
    const loc = await getUserLocation();
    setUserLocation(loc);
    if (loc) setRadiusKm(10);
    setLocLoading(false);
  };

  const filtered = useMemo(() => {
    let result = activities;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) ||
               a.description?.toLowerCase().includes(q) ||
               a.location.address.toLowerCase().includes(q),
      );
    }

    if (sportFilter) {
      result = result.filter((a) => a.activityType === sportFilter);
    }

    if (categoryFilter) {
      result = result.filter((a) => a.category === categoryFilter);
    }

    if (radiusKm > 0 && userLocation) {
      result = result.filter((a) => {
        if (!a.location.latitude && !a.location.longitude) return true;
        const dist = haversineDistance(
          userLocation.latitude, userLocation.longitude,
          a.location.latitude,  a.location.longitude,
        );
        return dist <= radiusKm;
      });
    }

    return result;
  }, [activities, search, sportFilter, categoryFilter, radiusKm, userLocation]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-700">Aktiviteleri Keşfet</h1>
          <p className="text-sm text-brand-fume mt-0.5">{filtered.length} aktivite</p>
        </div>
        <Link href="/activities/create" className="btn-secondary btn-md inline-flex items-center justify-center no-underline text-white">
          + Aktivite Oluştur
        </Link>
      </div>

      {/* Arama + Görünüm toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-fume">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Aktivite, spor türü veya konum ara..."
            className="input-base pl-9"
          />
        </div>
        <div className="flex rounded-lg border-2 border-brand-border overflow-hidden shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm font-heading font-semibold transition-colors ${viewMode === 'list' ? 'bg-primary-700 text-white' : 'text-brand-fume hover:bg-gray-50'}`}
          >
            ☰ Liste
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 text-sm font-heading font-semibold transition-colors ${viewMode === 'map' ? 'bg-primary-700 text-white' : 'text-brand-fume hover:bg-gray-50'}`}
          >
            🗺️ Harita
          </button>
        </div>
      </div>

      {/* Kategori filtresi */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <button
          onClick={() => setCategoryFilter(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm font-heading font-semibold border-2 transition-colors ${
            !categoryFilter ? 'bg-primary-700 text-white border-primary-700' : 'border-brand-border text-brand-fume hover:border-primary-300'
          }`}
        >
          Tüm Kategoriler
        </button>
        {ACTIVITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? undefined : cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-heading font-semibold border-2 transition-colors ${
              categoryFilter === cat ? 'bg-primary-700 text-white border-primary-700' : 'border-brand-border text-brand-fume hover:border-primary-300'
            }`}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Aktivite türü filtresi */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button
          onClick={() => setSportFilter(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm font-heading font-semibold border-2 transition-colors ${
            !sportFilter ? 'bg-primary-700 text-white border-primary-700' : 'border-brand-border text-brand-fume hover:border-primary-300'
          }`}
        >
          Tüm Türler
        </button>
        {ACTIVITY_TYPES.map((sport) => (
          <button
            key={sport}
            onClick={() => setSportFilter(sport === sportFilter ? undefined : sport)}
            className={`px-3 py-1.5 rounded-full text-sm font-heading font-semibold border-2 transition-colors ${
              sportFilter === sport ? 'bg-primary-700 text-white border-primary-700' : 'border-brand-border text-brand-fume hover:border-primary-300'
            }`}
          >
            <ActivityIcon type={sport} size={20} className="inline-block mr-1 align-middle" /> {ACTIVITY_LABELS[sport]}
          </button>
        ))}
      </div>

      {/* Konum filtresi */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {!userLocation ? (
          <button
            onClick={requestLocation}
            disabled={locLoading}
            className="flex items-center gap-2 text-sm font-heading font-semibold text-accent-dark border-2 border-accent-dark rounded-full px-4 py-1.5 hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            {locLoading ? (
              <span className="w-4 h-4 border-2 border-accent-dark border-t-transparent rounded-full animate-spin" />
            ) : '📍'}
            Konumumu kullan
          </button>
        ) : (
          <>
            <span className="text-sm text-brand-fume">📍 Mesafe:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-3 py-1.5 rounded-full text-sm font-heading font-semibold border-2 transition-colors ${
                  radiusKm === r ? 'bg-accent-dark text-white border-accent-dark' : 'border-brand-border text-brand-fume hover:border-accent-dark'
                }`}
              >
                {RADIUS_LABELS[r]}
              </button>
            ))}
            <button
              onClick={() => { setUserLocation(null); setRadiusKm(0); }}
              className="text-xs text-brand-fume hover:text-status-error transition-colors"
            >
              ✕ Konumu kaldır
            </button>
          </>
        )}
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[60vh] min-h-[400px]">
          <ActivityMap activities={filtered} userLocation={userLocation} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-heading font-semibold text-black mb-1">Aktivite bulunamadı</p>
          <p className="text-sm text-brand-fume mb-4">Filtreleri değiştir veya yeni aktivite oluştur.</p>
          <Link href="/activities/create" className="btn-primary btn-md inline-flex items-center justify-center no-underline text-white">
            Aktivite Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((activity) => {
            const isFull = activity.currentParticipants >= activity.maxParticipants;
            const dist = userLocation && (activity.location.latitude || activity.location.longitude)
              ? haversineDistance(userLocation.latitude, userLocation.longitude, activity.location.latitude, activity.location.longitude)
              : null;

            return (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="card hover:border-primary-300 no-underline group transition-colors block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
                    <ActivityIcon type={activity.activityType} size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-semibold text-black group-hover:text-primary-700 transition-colors truncate">
                        {activity.title}
                      </h3>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                      }`}>
                        {activity.currentParticipants}/{activity.maxParticipants}
                      </span>
                    </div>
                    <p className="text-sm text-brand-fume mt-0.5">
                      {ACTIVITY_LABELS[activity.activityType as ActivityType] ?? activity.activityType} · {formatDate(activity.startTime)}
                      {activity.category && (
                        <span className="ml-2 text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-1.5 py-0.5">
                          {CATEGORY_ICONS[activity.category]} {CATEGORY_LABELS[activity.category]}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-sm text-brand-fume truncate">📍 {activity.location.address}</p>
                      {dist !== null && (
                        <span className="text-xs text-accent-dark font-semibold shrink-0">
                          {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
