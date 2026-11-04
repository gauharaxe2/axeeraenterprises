import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Error Handling per firebase-integration-rpc specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test as mandated by the Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache and optimistic state.');
    }
    return false;
  }
}

// Sync section to Firestore
export async function saveSectionToFirestore(sectionId: string, data: unknown): Promise<void> {
  const docPath = `site_content/${sectionId}`;
  try {
    const docRef = doc(db, 'site_content', sectionId);
    await setDoc(docRef, {
      id: sectionId,
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Fetch all site content documents from Firestore
export async function getAllSiteContentDocs(): Promise<Record<string, { id: string; updatedAt?: string; data?: string }>> {
  const querySnap = await getDocs(collection(db, 'site_content'));
  const result: Record<string, { id: string; updatedAt?: string; data?: string }> = {};
  querySnap.forEach((d) => {
    result[d.id] = d.data() as { id: string; updatedAt?: string; data?: string };
  });
  return result;
}

// Save inquiry submission to Firestore
export async function saveSubmissionToFirestore(submission: {
  fullName: string;
  email: string;
  message: string;
  service?: string;
  budget?: string;
  phone?: string;
}): Promise<string | null> {
  const collectionPath = 'submissions';
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      ...submission,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to log submission to Firestore:', error);
    return null;
  }
}
