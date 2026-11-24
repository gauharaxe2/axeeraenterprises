import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import {
  CATALOG_SETTINGS_ID,
  SETTINGS_COLLECTION,
  isSafeDocId,
  toFirestoreDoc
} from './catalog';

export type CatalogRow = Record<string, unknown> & { id: string };

export function watchCollection(
  name: string,
  publishedOnly: boolean,
  onChange: (rows: CatalogRow[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  const ref = collection(db, name);
  const source = publishedOnly ? query(ref, where('published', '==', true)) : ref;
  return onSnapshot(
    source,
    (snap) => {
      onChange(
        snap.docs.map((entry) => {
          const data = entry.data() as Record<string, unknown>;
          return { ...data, id: entry.id };
        })
      );
    },
    (error) => onError(error)
  );
}

export function watchDocument(
  collectionName: string,
  id: string,
  onChange: (data: Record<string, unknown> | null) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, collectionName, id),
    (snap) => {
      onChange(snap.exists() ? (snap.data() as Record<string, unknown>) : null);
    },
    (error) => onError(error)
  );
}

export async function replaceCollection(
  name: string,
  items: CatalogRow[],
  removedIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    if (!isSafeDocId(item.id)) {
      throw new Error(`"${item.id}" is not a valid Firestore id.`);
    }
    const payload = toFirestoreDoc({ ...item, id: item.id, updatedAt: new Date().toISOString() });
    batch.set(doc(db, name, item.id), payload as Record<string, unknown>);
  }
  for (const id of removedIds) {
    if (isSafeDocId(id)) batch.delete(doc(db, name, id));
  }
  await batch.commit();
}

export async function removeCatalogDoc(name: string, id: string): Promise<void> {
  if (!isSafeDocId(id)) throw new Error(`"${id}" is not a valid Firestore id.`);
  await deleteDoc(doc(db, name, id));
}

export async function readSettingsDoc(id: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, SETTINGS_COLLECTION, id));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function saveSettingsDoc(id: string, data: Record<string, unknown>): Promise<void> {
  const payload = toFirestoreDoc(data);
  await setDoc(doc(db, SETTINGS_COLLECTION, id), payload as Record<string, unknown>, { merge: true });
}

export { CATALOG_SETTINGS_ID, SETTINGS_COLLECTION };
