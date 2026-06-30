import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
// Support both client environment variables and fallback json config
const metaEnv = (import.meta as any).env || {};
const finalConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "",
};

try {
  const firebaseConfig = require('../../firebase-applet-config.json');
  finalConfig.apiKey = finalConfig.apiKey || firebaseConfig.apiKey;
  finalConfig.authDomain = finalConfig.authDomain || firebaseConfig.authDomain;
  finalConfig.projectId = finalConfig.projectId || firebaseConfig.projectId;
  finalConfig.storageBucket = finalConfig.storageBucket || firebaseConfig.storageBucket;
  finalConfig.messagingSenderId = finalConfig.messagingSenderId || firebaseConfig.messagingSenderId;
  finalConfig.appId = finalConfig.appId || firebaseConfig.appId;
  finalConfig.measurementId = finalConfig.measurementId || firebaseConfig.measurementId;
} catch (e) {
  // Config file not found, continuing with env variables or empty config
}

const app = initializeApp(finalConfig);
let firestoreDbId = '(default)';
try {
  const firebaseConfig = require('../../firebase-applet-config.json');
  firestoreDbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
} catch (e) {}

const dbId = metaEnv.VITE_FIREBASE_DATABASE_ID || firestoreDbId || '(default)';
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  const cleanObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleanObj[key] = cleanUndefined(val);
      }
    }
  }
  return cleanObj as T;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code || '';
  
  const isPermissionDenied = 
    errorCode === 'permission-denied' || 
    errorMessage.toLowerCase().includes('permission') || 
    errorMessage.toLowerCase().includes('denied');

  if (isPermissionDenied) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Connection/Transient Warning: ', JSON.stringify(errInfo));
  }
}

// Validate connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    console.warn("Initial Firestore connection test resulted in: ", error instanceof Error ? error.message : String(error));
  }
}
testConnection();
