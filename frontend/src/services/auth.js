// Authentication service abstraction
// This module wraps Firebase Auth methods so the rest of the app
// doesn't import Firebase directly — making it easy to swap providers later.

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

function checkAuthInitialized() {
  if (!auth) {
    throw new Error('Firebase credentials are not configured in frontend/.env. Please set VITE_FIREBASE_API_KEY.');
  }
}

export async function loginWithGoogle() {
  checkAuthInitialized();
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function loginWithEmail(email, password) {
  checkAuthInitialized();
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function logout() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export function getCurrentUser() {
  return auth ? auth.currentUser : null;
}

export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken() {
  if (!auth || !auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

function mapFirebaseError(error) {
  if (error && !error.code) return error; // Custom error object already
  const code = error?.code || '';

  const messages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Allow popups and try again.',
    'auth/cancelled-popup-request': null,
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
  };

  const message = messages[code];
  if (message === null) return null;
  return new Error(message || error.message || 'An unexpected error occurred. Please try again.');
}
