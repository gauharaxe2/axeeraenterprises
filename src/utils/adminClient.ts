import {
  deleteSubmissionFromFirestore,
  listSubmissionsFromFirestore,
  setSubmissionReadInFirestore,
  subscribeToSubmissions,
  type EnquiryRecord
} from './firebase';

export type Enquiry = EnquiryRecord;

export interface EnquiryList {
  submissions: Enquiry[];
  truncated: boolean;
  formFound: boolean;
  readState: 'ok' | 'unavailable';
}

function readableError(error: unknown): string {
  if (!(error instanceof Error)) return 'Could not load enquiries.';
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    if (parsed?.error) return parsed.error;
  } catch {
    /* plain message */
  }
  return error.message || 'Could not load enquiries.';
}

export async function fetchEnquiries(): Promise<EnquiryList> {
  try {
    const submissions = await listSubmissionsFromFirestore();
    return {
      submissions,
      truncated: false,
      formFound: true,
      readState: 'ok'
    };
  } catch (error) {
    throw new Error(readableError(error));
  }
}

/** Subscribe to visitor contact-form submissions for the admin inbox. */
export function watchEnquiries(
  onChange: (list: EnquiryList) => void,
  onError?: (message: string) => void
): () => void {
  return subscribeToSubmissions(
    (submissions) => {
      onChange({
        submissions,
        truncated: false,
        formFound: true,
        readState: 'ok'
      });
    },
    onError
  );
}

export async function updateEnquiry(action: 'delete' | 'read', id: string, read?: boolean): Promise<void> {
  if (!id.trim()) throw new Error('Invalid submission id.');
  if (action === 'delete') {
    await deleteSubmissionFromFirestore(id);
    return;
  }
  await setSubmissionReadInFirestore(id, read !== false);
}
