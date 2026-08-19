// Firebase client-side initialization (safely handled)

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let auth = null;

// Require complete environment-specific authentication configuration
const hasCompleteAuthConfig =
  Boolean(firebaseConfig.apiKey) &&
  firebaseConfig.apiKey !== 'your-firebase-api-key' &&
  Boolean(firebaseConfig.authDomain) &&
  firebaseConfig.authDomain !== 'your-project-id.firebaseapp.com' &&
  Boolean(firebaseConfig.projectId) &&
  firebaseConfig.projectId !== 'your-firebase-project-id';

if (hasCompleteAuthConfig) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization warning:', err.message);
  }
}

export { auth };
export default app;
