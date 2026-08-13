import type { SkillLevel, ActivityType, ActivityCategory, ActivityStatus, ParticipantStatus } from '@/lib/constants';

export interface UserProfile {
  uid:              string;
  email:            string;
  displayName:      string;
  photoURL?:        string;
  bio?:             string;
  sportPreferences: ActivityType[];
  skillLevel:       SkillLevel;
  location?: {
    latitude:  number;
    longitude: number;
  };
  createdAt:        Date;
  updatedAt:        Date;
  isEmailVerified:  boolean;
  status:           'active' | 'suspended' | 'deleted';
  onboarded?:       boolean;
  city?:            string;
  activityTypes?:   ActivityType[];
  experience?:      string;
}

export interface Activity {
  id:                 string;
  title:              string;
  description:        string;
  activityType:       ActivityType | 'custom';
  category:           ActivityCategory;
  customTypeName?:    string;
  customTypeStatus?:  'pending' | 'approved' | 'rejected' | null;
  skillLevel:         SkillLevel | 'all';
  location: {
    latitude:  number;
    longitude: number;
    address:   string;
  };
  startTime:           Date;
  endTime:             Date;
  maxParticipants:     number;
  currentParticipants: number;
  createdBy:           string;
  organizerId:         string;
  organizerName:       string;
  status:              ActivityStatus;
  imageUrl?:           string;
  createdAt:           Date;
  updatedAt:           Date;
}

export interface Participant {
  userId:      string;
  displayName: string;
  photoURL?:   string;
  status:      ParticipantStatus;
  joinedAt:    Date;
}
