import { getStore } from '@netlify/blobs';

const STORE_NAME = 'contact-enquiry-reads';
const READ_KEY = 'read-ids';

export interface ReadStore {
  readIds(): Promise<Set<string>>;
  setRead(id: string, read: boolean): Promise<void>;
}

function asIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function createBlobReadStore(siteID: string, token: string): ReadStore {
  const store = getStore({
    name: STORE_NAME,
    siteID,
    token,
    consistency: 'strong'
  });

  return {
    async readIds() {
      const raw = await store.get(READ_KEY, { type: 'json' });
      return new Set(asIdList(raw));
    },
    async setRead(id, read) {
      const current = new Set(asIdList(await store.get(READ_KEY, { type: 'json' })));
      if (read) current.add(id);
      else current.delete(id);
      await store.setJSON(READ_KEY, [...current]);
    }
  };
}
