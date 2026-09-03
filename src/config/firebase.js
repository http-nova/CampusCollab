import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Reads stored keys from LocalStorage if set in UI Settings, otherwise from .env
const getFirebaseConfigValue = (key, envValue) => {
  const localVal = localStorage.getItem(`campuscollab_fb_${key}`);
  if (localVal) return localVal;
  return envValue || '';
};

export const getActiveFirebaseConfig = () => {
  return {
    apiKey: getFirebaseConfigValue('apiKey', import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: getFirebaseConfigValue('authDomain', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: getFirebaseConfigValue('projectId', import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: getFirebaseConfigValue('storageBucket', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: getFirebaseConfigValue('messagingSenderId', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: getFirebaseConfigValue('appId', import.meta.env.VITE_FIREBASE_APP_ID)
  };
};

const config = getActiveFirebaseConfig();

// Check if valid credentials are available
export const isFirebaseConfigured = Boolean(
  config.apiKey && config.apiKey !== 'your_api_key_here' &&
  config.projectId && config.projectId !== 'your_project_id'
);

// Fallback demo config to prevent SDK initialization errors if unconfigured
const effectiveConfig = isFirebaseConfigured ? config : {
  apiKey: 'demo-api-key',
  authDomain: 'campuscollab-demo.firebaseapp.com',
  projectId: 'campuscollab-demo',
  storageBucket: 'campuscollab-demo.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef'
};

const app = getApps().length > 0 ? getApp() : initializeApp(effectiveConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const saveCustomFirebaseConfig = (customConfig) => {
  Object.entries(customConfig).forEach(([k, v]) => {
    if (v) {
      localStorage.setItem(`campuscollab_fb_${k}`, v);
    } else {
      localStorage.removeItem(`campuscollab_fb_${k}`);
    }
  });
  window.location.reload();
};
