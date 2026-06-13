import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import type { SportType, SkillLevel } from '@/lib/constants';

export const profileService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      uid,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as UserProfile;
  },

  async updateProfile(uid: string, updates: {
    displayName?: string;
    bio?: string;
    sportPreferences?: SportType[];
    skillLevel?: SkillLevel;
  }): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName });
    }
  },
};
