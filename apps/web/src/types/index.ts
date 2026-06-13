import type { SkillLevel, SportType, ActivityStatus, ParticipantStatus } from '@/lib/constants';

export interface UserProfile {
  uid:              string;
  email:            string;
  displayName:      string;
  photoURL?:        string;
  bio?:             string;
  sportPreferences: SportType[];
  skillLevel:       SkillLevel;
  location?: {
    latitude:  number;
    longitude: number;
  };
  createdAt:        Date;
  updatedAt:        Date;
  isEmailVerified:  boolean;
  status:           'active' | 'suspended' | 'deleted';
}

export interface Activity {
  id:                 string;
  title:              string;
  description:        string;
  sportType:          SportType;
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
