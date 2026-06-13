'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuthCookie() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Strict`;
      } else {
        document.cookie = 'firebase-auth-token=; path=/; max-age=0';
      }
    });
    return unsubscribe;
  }, []);
}
