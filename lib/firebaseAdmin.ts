import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const requiredEnvKeys = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];
// Returns an array of missing environment variable keys required for Firebase Admin SDK
export const getMissingFirebaseAdminEnv = () =>
  requiredEnvKeys.filter((key) => !process.env[key]);

const getFirebaseAdminConfig = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n')
    })
  };
};

export const getFirebaseAdmin = (): App | null => {
  const config = getFirebaseAdminConfig();
  if (!config) {
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp(config);
};

export const getFirebaseMessaging = () => {
  const app = getFirebaseAdmin();
  if (!app) {
    return null;
  }
  return getMessaging(app);
};
