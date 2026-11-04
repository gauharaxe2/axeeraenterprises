import {
  deleteSubmissionFromFirestore,
  listSubmissionsFromFirestore,
  setSubmissionReadInFirestore,
  type EnquiryRecord
} from './firebase';

export type Enquiry = EnquiryRecord;

export interface EnquiryList {
  submissions: Enquiry[];
  truncated: boolean;
  formFound: boolean;
  readState: 'ok' | 'unavailable';
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
    const message = error instanceof Error ? error.message : 'Could not load enquiries.';
    throw new Error(message);
  }
}

export async function updateEnquiry(action: 'delete' | 'read', id: string, read?: boolean): Promise<void> {
  if (!id.trim()) throw new Error('Invalid submission id.');
  if (action === 'delete') {
    await deleteSubmissionFromFirestore(id);
    return;
  }
  await setSubmissionReadInFirestore(id, read !== false);
}
