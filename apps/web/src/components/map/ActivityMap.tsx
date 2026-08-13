'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import type { Activity } from '@/types';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface Props {
  activities: Activity[];
  userLocation?: { latitude: number; longitude: number } | null;
  onActivityClick?: (activity: Activity) => void;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function ActivityMap({ activities, userLocation, onActivityClick }: Props) {
  const [popup, setPopup] = useState<Activity | null>(null);

  const initialView = userLocation
    ? { longitude: userLocation.longitude, latitude: userLocation.latitude, zoom: 12 }
    : { longitude: 29.01, latitude: 41.01, zoom: 10 }; // İstanbul default

  const validActivities = activities.filter(
    (a) => a.location.latitude !== 0 || a.location.longitude !== 0,
  );

  const handleMarkerClick = useCallback((activity: Activity) => {
    setPopup(activity);
    onActivityClick?.(activity);
  }, [onActivityClick]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={initialView}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-right" />

        {/* Kullanıcı konumu */}
        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
            <div className="w-4 h-4 bg-accent-dark rounded-full border-2 border-white shadow-md" />
          </Marker>
        )}

        {/* Aktivite pinleri */}
        {validActivities.map((activity) => {
          const isFull = activity.currentParticipants >= activity.maxParticipants;
          return (
            <Marker
              key={activity.id}
              longitude={activity.location.longitude}
              latitude={activity.location.latitude}
              anchor="bottom"
              onClick={(e) => { e.originalEvent.stopPropagation(); handleMarkerClick(activity); }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md border-2 cursor-pointer transition-transform hover:scale-110 ${
                  isFull ? 'bg-gray-200 border-gray-400' : 'bg-white border-primary-700'
                }`}
                title={activity.title}
              >
                <ActivityIcon type={activity.activityType} size={24} />
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        {popup && (
          <Popup
            longitude={popup.location.longitude}
            latitude={popup.location.latitude}
            anchor="bottom"
            offset={40}
            onClose={() => setPopup(null)}
            closeButton
            closeOnClick={false}
          >
            <div className="p-1 min-w-[200px]">
              <p className="font-heading font-bold text-sm text-black mb-1 pr-4">{popup.title}</p>
              <p className="text-xs text-brand-fume mb-1">🗓 {formatDate(popup.startTime)}</p>
              <p className="text-xs text-brand-fume mb-2">📍 {popup.location.address}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  popup.currentParticipants >= popup.maxParticipants
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {popup.currentParticipants}/{popup.maxParticipants} kişi
                </span>
                <a
                  href={`/activities/${popup.id}`}
                  className="text-xs text-primary-700 font-semibold hover:underline"
                >
                  Detay →
                </a>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
