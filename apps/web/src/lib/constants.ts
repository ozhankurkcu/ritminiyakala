export const ACTIVITY_TYPES = [
  'yuruyus', 'kosu', 'tenis', 'dans', 'fitness',
  'padel', 'bisiklet', 'futbol', 'basketbol',
  'doga-sporlari', 'diger',
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  yuruyus:       'Yürüyüş',
  kosu:          'Koşu',
  tenis:         'Tenis',
  dans:          'Dans',
  fitness:       'Fitness',
  padel:         'Padel',
  bisiklet:      'Bisiklet',
  futbol:        'Futbol',
  basketbol:     'Basketbol',
  'doga-sporlari': 'Doğa Sporları',
  diger:         'Diğer',
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  yuruyus:         '/icons/yuruyus.png',
  kosu:            '/icons/kosu.png',
  tenis:           '/icons/tenis.png',
  dans:            '/icons/dans.png',
  fitness:         '/icons/fitness.png',
  padel:           '/icons/padel.png',
  bisiklet:        '/icons/bisiklet.png',
  futbol:          '/icons/futbol.png',
  basketbol:       '/icons/basketbol.png',
  'doga-sporlari': '/icons/doga-sporlari.png',
  diger:           '/icons/diger.png',
};

// ── Aktivite Kategorileri ──────────────────────────────────────────────────
export const ACTIVITY_CATEGORIES = [
  'takim-sporlari',
  'bireysel-sporlar',
  'doga-acik-hava',
  'fitness-saglik',
  'dans-sanat',
  'su-sporlari',
  'zihin-oyunlari',
  'e-spor',
  'diger',
] as const;

export type ActivityCategory = typeof ACTIVITY_CATEGORIES[number];

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  'takim-sporlari':  'Takım Sporları',
  'bireysel-sporlar': 'Bireysel Sporlar',
  'doga-acik-hava':  'Doğa & Açık Hava',
  'fitness-saglik':  'Fitness & Sağlık',
  'dans-sanat':      'Dans & Sanat',
  'su-sporlari':     'Su Sporları',
  'zihin-oyunlari':  'Zihin Oyunları',
  'e-spor':          'E-Spor',
  'diger':           'Diğer',
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  'takim-sporlari':  '⚽',
  'bireysel-sporlar': '🏃',
  'doga-acik-hava':  '🌲',
  'fitness-saglik':  '💪',
  'dans-sanat':      '💃',
  'su-sporlari':     '🏄',
  'zihin-oyunlari':  '♟️',
  'e-spor':          '🎮',
  'diger':           '✨',
};

// Aktivite tipi → Varsayılan kategori eşlemesi
export const ACTIVITY_TYPE_CATEGORY: Record<string, ActivityCategory> = {
  yuruyus:         'bireysel-sporlar',
  kosu:            'bireysel-sporlar',
  tenis:           'bireysel-sporlar',
  padel:           'bireysel-sporlar',
  bisiklet:        'bireysel-sporlar',
  futbol:          'takim-sporlari',
  basketbol:       'takim-sporlari',
  dans:            'dans-sanat',
  fitness:         'fitness-saglik',
  'doga-sporlari': 'doga-acik-hava',
  diger:           'diger',
};

// Önerilen aktivite türleri → kategori eşlemesi
export const CUSTOM_TYPE_CATEGORY: Record<string, ActivityCategory> = {
  'Satranç':         'zihin-oyunlari',
  'Okçuluk':         'bireysel-sporlar',
  'Kaligrafi':       'dans-sanat',
  'Sörf':            'su-sporlari',
  'Kaya Tırmanışı':  'doga-acik-hava',
  'Drone Yarışı':    'e-spor',
  'Akrobasi':        'dans-sanat',
  'Fotoğrafçılık':   'dans-sanat',
  'Stand-up Paddle': 'su-sporlari',
  'Parkur':          'bireysel-sporlar',
  'Eskrim':          'bireysel-sporlar',
  'Boks':            'bireysel-sporlar',
  'Trambolin':       'fitness-saglik',
  'Kano':            'su-sporlari',
  'E-Spor':          'e-spor',
  'Meditasyon':      'fitness-saglik',
  'Masa Tenisi':     'bireysel-sporlar',
  'Hip-Hop Dans':    'dans-sanat',
  'Nefes Egzersizi': 'fitness-saglik',
};

// Tecrübe seviyeleri
export const EXPERIENCE_LEVELS = ['beginner', 'irregular', 'regular', 'daily'] as const;
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner:  'Yeni başladım',
  irregular: 'Aralıklı, düzensiz olarak',
  regular:   'Belirli aralıklarla düzenli olarak',
  daily:     'Her gün, düzenli olarak',
};

// Eski SkillLevel — geriye dönük uyumluluk için tutuldu
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner:     'Başlangıç',
  intermediate: 'Orta Seviye',
  advanced:     'İleri Seviye',
};

// Aktivite görünürlüğü
export const ACTIVITY_VISIBILITY = ['public', 'friends', 'private'] as const;
export type ActivityVisibility = typeof ACTIVITY_VISIBILITY[number];

export const VISIBILITY_LABELS: Record<ActivityVisibility, string> = {
  public:  'Herkese Açık',
  friends: 'Arkadaşlara Açık',
  private: 'Kişiye Özel',
};

export const VISIBILITY_DESCRIPTIONS: Record<ActivityVisibility, string> = {
  public:  'Platformdaki herkes görebilir ve katılabilir',
  friends: 'Sadece arkadaşların görebilir',
  private: 'Sadece davet ettiğin kişiler katılabilir',
};

// Tekrarlama sıklığı
export const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
export type RecurrenceFrequency = typeof RECURRENCE_FREQUENCIES[number];

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily:   'Günlük',
  weekly:  'Haftalık',
  monthly: 'Aylık',
};

export const ACTIVITY_STATUS = ['scheduled', 'ongoing', 'completed', 'cancelled', 'archived'] as const;
export type ActivityStatus = typeof ACTIVITY_STATUS[number];

export const PARTICIPANT_STATUS = ['confirmed', 'pending', 'declined', 'cancelled'] as const;
export type ParticipantStatus = typeof PARTICIPANT_STATUS[number];

export const MAX_ACTIVITY_RADIUS_KM     = 20;
export const DEFAULT_ACTIVITY_RADIUS_KM = 10;
