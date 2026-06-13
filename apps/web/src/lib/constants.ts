export const SPORT_TYPES = [
  'futbol', 'basketbol', 'voleybol', 'tenis', 'padel',
  'kosu', 'yuruyus', 'bisiklet', 'yuzme', 'fitness',
  'yoga', 'dans', 'doga-sporlari', 'diger',
] as const;

export type SportType = typeof SPORT_TYPES[number];

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner:     'Başlangıç',
  intermediate: 'Orta Seviye',
  advanced:     'İleri Seviye',
};

export const ACTIVITY_STATUS = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;
export type ActivityStatus = typeof ACTIVITY_STATUS[number];

export const PARTICIPANT_STATUS = ['confirmed', 'pending', 'declined', 'cancelled'] as const;
export type ParticipantStatus = typeof PARTICIPANT_STATUS[number];

export const MAX_ACTIVITY_RADIUS_KM = 20;
export const DEFAULT_ACTIVITY_RADIUS_KM = 10;
