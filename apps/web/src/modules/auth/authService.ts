import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  async signupWithEmail(email: string, password: string, displayName: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, { displayName });

    await setDoc(doc(db, 'users', user.uid), {
      email:            user.email,
      displayName:      displayName,
      photoURL:         null,
      bio:              '',
      sportPreferences: [],
      skillLevel:       'beginner',
      location:         null,
      createdAt:        serverTimestamp(),
      updatedAt:        serverTimestamp(),
      isEmailVerified:  false,
      status:           'active',
    });

    await sendEmailVerification(user);

    return user;
  },

  async loginWithEmail(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // E-posta doğrulama ZORUNLU DEĞİL — signup ekranı "onaylamadan da devam
    // edebilirsin" dediği için girişi engellemiyoruz. Doğrulanmamışsa sadece
    // hatırlatma amaçlı yeni bir doğrulama e-postası gönderiyoruz (arka planda,
    // hata olursa yutuluyor ki giriş bloklanmasın).
    if (!user.emailVerified) {
      sendEmailVerification(user).catch(() => {/* sessizce geç */});
    }

    return user;
  },

  async loginWithGoogle(): Promise<void> {
    await signInWithRedirect(auth, googleProvider);
  },

  async handleGoogleRedirect(): Promise<User | null> {
    const result = await getRedirectResult(auth);
    if (!result) return null;

    const { user } = result;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email:            user.email,
        displayName:      user.displayName ?? '',
        photoURL:         user.photoURL ?? null,
        bio:              '',
        sportPreferences: [],
        skillLevel:       'beginner',
        location:         null,
        createdAt:        serverTimestamp(),
        updatedAt:        serverTimestamp(),
        isEmailVerified:  true,
        status:           'active',
      });
    }

    return user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async resendVerificationEmail(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },
};
