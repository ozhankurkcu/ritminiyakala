import {
  collection, collectionGroup, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, serverTimestamp, query, where, orderBy,
  increment, setDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Activity, Participant } from '@/types';
import type { ActivityType, ActivityCategory } from '@/lib/constants';

export interface CreateActivityInput {
  title:            string;
  description:      string;
  activityType:     ActivityType | 'custom';
  category:         ActivityCategory;
  customTypeName?:  string;
  customTypeStatus?: string | null;
  skillLevel:      string;
  experience?:     string;
  experienceYears?: number;
  visibility?:     string;
  scheduleType?:   string;
  recurrence?:     {
    frequency:     string;
    every:         number;
    durationValue: number;
    durationUnit:  string;
  };
  address:         string;
  latitude?:       number;
  longitude?:      number;
  startTime:       Date;
  endTime:         Date;
  maxParticipants: number;
}

function toActivity(id: string, data: Record<string, unknown>): Activity {
  return {
    ...data,
    id,
    startTime:  (data.startTime  as Timestamp)?.toDate?.() ?? new Date(),
    endTime:    (data.endTime    as Timestamp)?.toDate?.() ?? new Date(),
    createdAt:  (data.createdAt  as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt:  (data.updatedAt  as Timestamp)?.toDate?.() ?? new Date(),
    location: {
      latitude:  0,
      longitude: 0,
      address:   (data.location as { address?: string })?.address ?? '',
    },
  } as Activity;
}

export const activityService = {
  async createActivity(
    organizerId: string,
    organizerName: string,
    input: CreateActivityInput,
  ): Promise<string> {
    const ref = await addDoc(collection(db, 'activities'), {
      title:               input.title,
      description:         input.description,
      activityType:        input.activityType,
      category:            input.category,
      customTypeName:      input.customTypeName ?? null,
      customTypeStatus:    input.activityType === 'custom' ? 'pending' : null,
      skillLevel:          input.skillLevel,
      experience:          input.experience ?? input.skillLevel,
      experienceYears:     input.experienceYears ?? null,
      visibility:          input.visibility ?? 'public',
      scheduleType:        input.scheduleType ?? 'once',
      recurrence:          input.recurrence ?? null,
      location: {
        latitude:  input.latitude  ?? 0,
        longitude: input.longitude ?? 0,
        address:   input.address,
      },
      startTime:           Timestamp.fromDate(input.startTime),
      endTime:             Timestamp.fromDate(input.endTime),
      maxParticipants:     input.maxParticipants,
      currentParticipants: 1,
      organizerId,
      organizerName,
      createdBy:           organizerId,
      status:              'scheduled',
      createdAt:           serverTimestamp(),
      updatedAt:           serverTimestamp(),
    });

    // Organizer auto-joins as confirmed participant
    await setDoc(doc(db, 'activities', ref.id, 'participants', organizerId), {
      userId:      organizerId,
      displayName: organizerName,
      photoURL:    null,
      status:      'confirmed',
      joinedAt:    serverTimestamp(),
    });

    return ref.id;
  },

  async getActivity(id: string): Promise<Activity | null> {
    const snap = await getDoc(doc(db, 'activities', id));
    if (!snap.exists()) return null;
    return toActivity(snap.id, snap.data() as Record<string, unknown>);
  },

  async listActivities(activityType?: ActivityType): Promise<Activity[]> {
    let q = query(
      collection(db, 'activities'),
      where('status', '==', 'scheduled'),
      orderBy('startTime', 'asc'),
    );

    if (activityType) {
      q = query(
        collection(db, 'activities'),
        where('status', '==', 'scheduled'),
        where('activityType', '==', activityType),
        orderBy('startTime', 'asc'),
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => toActivity(d.id, d.data() as Record<string, unknown>));
  },

  async listMyActivities(userId: string): Promise<Activity[]> {
    const q = query(
      collection(db, 'activities'),
      where('organizerId', '==', userId),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => toActivity(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  },

  async joinActivity(activityId: string, userId: string, displayName: string): Promise<void> {
    await setDoc(doc(db, 'activities', activityId, 'participants', userId), {
      userId,
      displayName,
      photoURL: null,
      status:   'confirmed',
      joinedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'activities', activityId), {
      currentParticipants: increment(1),
      updatedAt: serverTimestamp(),
    });
  },

  async leaveActivity(activityId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'activities', activityId, 'participants', userId));
    await updateDoc(doc(db, 'activities', activityId), {
      currentParticipants: increment(-1),
      updatedAt: serverTimestamp(),
    });
  },

  async getParticipants(activityId: string): Promise<Participant[]> {
    const snap = await getDocs(collection(db, 'activities', activityId, 'participants'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        joinedAt: (data.joinedAt as Timestamp)?.toDate?.() ?? new Date(),
      } as Participant;
    });
  },

  async isParticipant(activityId: string, userId: string): Promise<boolean> {
    const snap = await getDoc(doc(db, 'activities', activityId, 'participants', userId));
    return snap.exists();
  },

  async cancelActivity(activityId: string): Promise<void> {
    await updateDoc(doc(db, 'activities', activityId), {
      status:    'cancelled',
      updatedAt: serverTimestamp(),
    });
  },

  async archiveActivity(activityId: string): Promise<void> {
    await updateDoc(doc(db, 'activities', activityId), {
      status:    'archived',
      updatedAt: serverTimestamp(),
    });
  },

  async deleteActivity(activityId: string): Promise<void> {
    await deleteDoc(doc(db, 'activities', activityId));
  },

  async updateActivity(activityId: string, updates: Partial<CreateActivityInput>): Promise<void> {
    const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (updates.title)           data.title           = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.address)         data.location        = { latitude: 0, longitude: 0, address: updates.address };
    if (updates.maxParticipants) data.maxParticipants = updates.maxParticipants;
    if (updates.startTime)       data.startTime       = Timestamp.fromDate(updates.startTime);
    if (updates.endTime)         data.endTime         = Timestamp.fromDate(updates.endTime);
    if (updates.skillLevel)      data.skillLevel      = updates.skillLevel;
    if (updates.visibility)      data.visibility      = updates.visibility;
    await updateDoc(doc(db, 'activities', activityId), data);
  },

  async getJoinedActivities(userId: string): Promise<Activity[]> {
    // collectionGroup query — tüm activities altındaki participants koleksiyonunda userId ara
    const q = query(
      collectionGroup(db, 'participants'),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);

    // Her participant doc'un parent'ı (activity) fetch et
    const activityPromises = snap.docs.map((d) => {
      const activityRef = d.ref.parent.parent;
      if (!activityRef) return Promise.resolve(null);
      return getDoc(activityRef).then((actSnap) => {
        if (!actSnap.exists()) return null;
        return toActivity(actSnap.id, actSnap.data() as Record<string, unknown>);
      });
    });

    const activities = await Promise.all(activityPromises);
    return (activities.filter(Boolean) as Activity[])
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  },
};
