import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type Unsubscribe
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

export interface ContactSubmissionInput {
  fullName: string;
  email: string;
  message: string;
  service?: string;
  company?: string;
  phone?: string;
}

export interface EnquiryRecord {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  read: boolean;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function createdAtIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      // fall through
    }
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
    return value.trim();
  }
  return new Date().toISOString();
}

function mapSubmissionDoc(entry: { id: string; data: () => Record<string, unknown> }): EnquiryRecord {
  const data = entry.data();
  const companyFromBudget = asText(data.budget).replace(/^Company:\s*/i, '');
  return {
    id: entry.id,
    createdAt: createdAtIso(data.createdAt),
    name: asText(data.fullName) || asText(data.name),
    email: asText(data.email),
    company: asText(data.company) || companyFromBudget,
    service: asText(data.service),
    message: asText(data.message),
    read: data.read === true
  };
}

function sortEnquiries(rows: EnquiryRecord[]): EnquiryRecord[] {
  return [...rows].sort((left, right) => {
    const rightMs = Date.parse(right.createdAt);
    const leftMs = Date.parse(left.createdAt);
    return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
  });
}

// Save inquiry submission to Firestore
export async function saveSubmissionToFirestore(submission: ContactSubmissionInput): Promise<string | null> {
  const collectionPath = 'submissions';
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      fullName: submission.fullName,
      email: submission.email,
      message: submission.message,
      service: submission.service || '',
      company: submission.company || '',
      phone: submission.phone || '',
      read: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to log submission to Firestore:', error);
    return null;
  }
}

export async function listSubmissionsFromFirestore(): Promise<EnquiryRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'submissions'));
    const rows: EnquiryRecord[] = [];
    snap.forEach((entry) => {
      rows.push(mapSubmissionDoc({ id: entry.id, data: () => entry.data() as Record<string, unknown> }));
    });
    return sortEnquiries(rows);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'submissions');
  }
}

/** Live inbox updates for the admin Queries tab. */
export function subscribeToSubmissions(
  onChange: (rows: EnquiryRecord[]) => void,
  onError?: (message: string) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'submissions'),
    (snap) => {
      const rows: EnquiryRecord[] = [];
      snap.forEach((entry) => {
        rows.push(mapSubmissionDoc({ id: entry.id, data: () => entry.data() as Record<string, unknown> }));
      });
      onChange(sortEnquiries(rows));
    },
    (error) => {
      console.warn('Firestore submissions listener warning:', error);
      onError?.(error.message || 'Could not load enquiries.');
    }
  );
}

export async function setSubmissionReadInFirestore(id: string, read: boolean): Promise<void> {
  await updateDoc(doc(db, 'submissions', id), { read });
}

export async function deleteSubmissionFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'submissions', id));
}
