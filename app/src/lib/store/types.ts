import type { SigningRequest, CreateRequestInput, SignDocumentInput } from '@/types';

// Repository interface - this will be implemented by mock store now
// and can be replaced with Supabase implementation later

export interface ISigningRequestRepository {
  createRequest(input: CreateRequestInput): Promise<SigningRequest>;
  getRequest(token: string): Promise<SigningRequest | null>;
  signDocument(input: SignDocumentInput): Promise<SigningRequest | null>;
  listRequests(): Promise<SigningRequest[]>;
  deleteRequest(token: string): Promise<boolean>;
  updateRequestStatus(token: string): Promise<SigningRequest | null>;
}

// Mock storage keys
export const STORAGE_KEY = 'e-imza-signing-requests';
