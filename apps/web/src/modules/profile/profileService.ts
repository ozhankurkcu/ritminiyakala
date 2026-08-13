import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import type { ActivityType, SkillLevel, ExperienceLevel } from '@/lib/constants';

export const profileService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Auto-create profile from Firebase Auth data (handles users who registered
      // before Firestore rules were correctly configured)
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) return null;

      const newProfile = {
        email:            currentUser.email ?? '',
        displayName:      currentUser.displayName ?? '',
        photoURL:         currentUser.photoURL ?? null,
        bio:              '',
        sportPreferences: [],
        skillLevel:       'beginner',
        location:         undefined,
        createdAt:        serverTimestamp(),
        updatedAt:        serverTimestamp(),
        isEmailVerified:  currentUser.emailVerified,
        status:           'active',
      };
      await setDoc(ref, newProfile);

      return {
        ...newProfile,
        uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserProfile;
    }

    const data = snap.data();
    return {
      ...data,
      uid,
      // Eski kullanıcılarda onboarded alanı yok — var olan hesap sayılır
      onboarded: data.onboarded ?? true,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as UserProfile;
  },

  async updateProfile(uid: string, updates: {
    displayName?: string;
    bio?: string;
    sportPreferences?: ActivityType[];
    skillLevel?: SkillLevel;
    activityTypes?: ActivityType[];
    experience?: ExperienceLevel;
    city?: string;
    onboarded?: boolean;
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
