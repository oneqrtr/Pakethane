import type {
  SigningRequest,
  CreateRequestInput,
  SignDocumentInput,
  DocumentSignature,
} from '@/types';

// SINGLE CONSISTENT STORAGE KEY
export const STORAGE_KEY = 'signing_requests';

function generateToken(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REQ_${timestamp}_${random}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

// Debug helper
function debugLog(label: string, data: unknown) {
  console.log(`[Pakethane Panel] ${label}:`, data);
}

// LocalStorage Repository - Source of Truth
class LocalStorageRepository {
  // Get all requests from localStorage
  getAll(): Record<string, SigningRequest> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      debugLog('STORAGE_KEY used', STORAGE_KEY);
      debugLog('Raw localStorage data', data);

      if (!data) {
        debugLog('No data found in localStorage', null);
        return {};
      }

      const parsed = JSON.parse(data);
      debugLog('Parsed storage object', parsed);
      debugLog('Number of requests stored', Object.keys(parsed).length);
      debugLog('Stored tokens', Object.keys(parsed));

      return parsed;
    } catch (error) {
      console.error('[Pakethane] Failed to read from localStorage:', error);
      return {};
    }
  }

  // Save all requests to localStorage
  saveAll(requests: Record<string, SigningRequest>): void {
    try {
      debugLog('Saving to localStorage', { key: STORAGE_KEY, requestCount: Object.keys(requests).length });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      debugLog('Save successful', null);
    } catch (error) {
      console.error('[Pakethane] Failed to save to localStorage:', error);
    }
  }

  // Create new request
  async createRequest(input: CreateRequestInput): Promise<SigningRequest> {
    debugLog('Creating request with input', input);

    const token = generateToken();
    const now = getTimestamp();

    const request: SigningRequest = {
      token,
      email: input.email,
      adSoyad: input.adSoyad,
      selectedDocs: input.selectedDocs,
      signatures: {},
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    debugLog('Generated token', token);
    debugLog('New request object', request);

    const storage = this.getAll();
    storage[token] = request;
    this.saveAll(storage);

    debugLog('Request saved. All tokens now:', Object.keys(storage));

    return request;
  }

  // Get single request by token
  async getRequest(token: string): Promise<SigningRequest | null> {
    debugLog('Getting request for token', token);

    const storage = this.getAll();
    const request = storage[token];

    debugLog('Found request?', request ? 'YES' : 'NO');
    if (request) {
      debugLog('Request details', request);
    }

    return request || null;
  }

  // Sign a document
  async signDocument(
    input: SignDocumentInput
  ): Promise<SigningRequest | null> {
    debugLog('Signing document', { token: input.token, docCode: input.docCode });

    const storage = this.getAll();
    const request = storage[input.token];

    if (!request) {
      console.error('[Pakethane] Request not found for signing:', input.token);
      return null;
    }

    const signature: DocumentSignature = {
      docCode: input.docCode,
      signedAt: getTimestamp(),
      signaturePng: input.signaturePng,
      frontImage: input.frontImage,
      backImage: input.backImage,
      taxPlatePdf: input.taxPlatePdf,
      uploadedDocument: input.uploadedDocument,
      consentChecked: input.consentChecked,
      formData: input.formData,
    };

    request.signatures[input.docCode] = signature;
    request.updatedAt = getTimestamp();

    const signedCount = Object.keys(request.signatures).length;
    const totalCount = request.selectedDocs.length;

    if (signedCount === 0) {
      request.status = 'pending';
    } else if (signedCount < totalCount) {
      request.status = 'partial';
    } else {
      request.status = 'completed';
    }

    storage[input.token] = request;
    this.saveAll(storage);

    debugLog('Document signed successfully', { signedCount, totalCount, status: request.status });

    return request;
  }

  // List all requests
  async listRequests(): Promise<SigningRequest[]> {
    const storage = this.getAll();
    const requests = Object.values(storage).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    debugLog('Listing all requests', { count: requests.length });

    return requests;
  }

  // Update user info (adSoyad, email, cepNumarasi, tcKimlik, adres, surucuBelgesiTarihi, surucuSicilNo, userSignaturePng, savedAt, ipAddress)
  async updateRequestUserInfo(
    token: string,
    info: Partial<Pick<SigningRequest, 'adSoyad' | 'email' | 'cepNumarasi' | 'tcKimlik' | 'adres' | 'surucuBelgesiTarihi' | 'surucuSicilNo' | 'userSignaturePng' | 'savedAt' | 'ipAddress'>>
  ): Promise<SigningRequest | null> {
    const storage = this.getAll();
    const request = storage[token];
    if (!request) return null;

    if (info.adSoyad !== undefined) request.adSoyad = info.adSoyad;
    if (info.email !== undefined) request.email = info.email;
    if (info.cepNumarasi !== undefined) request.cepNumarasi = info.cepNumarasi;
    if (info.tcKimlik !== undefined) request.tcKimlik = info.tcKimlik;
    if (info.adres !== undefined) request.adres = info.adres;
    if (info.surucuBelgesiTarihi !== undefined) request.surucuBelgesiTarihi = info.surucuBelgesiTarihi;
    if (info.surucuSicilNo !== undefined) request.surucuSicilNo = info.surucuSicilNo;
    if (info.userSignaturePng !== undefined) request.userSignaturePng = info.userSignaturePng;
    if (info.savedAt !== undefined) request.savedAt = info.savedAt;
    if (info.ipAddress !== undefined) request.ipAddress = info.ipAddress;
    request.updatedAt = getTimestamp();

    storage[token] = request;
    this.saveAll(storage);
    return request;
  }

  // Delete request
  async deleteRequest(token: string): Promise<boolean> {
    debugLog('Deleting request', token);

    const storage = this.getAll();
    if (storage[token]) {
      delete storage[token];
      this.saveAll(storage);
      debugLog('Request deleted', token);
      return true;
    }

    debugLog('Request not found for deletion', token);
    return false;
  }
}

// Export singleton instance
export const mockStore = new LocalStorageRepository();

// URL helpers
export function getUserPanelUrl(token: string): string {
  return `/panel?token=${token}`;
}

export function getDocumentSignUrl(token: string, docCode: string): string {
  return `/panel/sign/${docCode}?token=${token}`;
}

// Status helpers
export function getStatusLabel(status: SigningRequest['status']): string {
  const labels = {
    pending: 'Bekliyor',
    partial: 'Kısmi',
    completed: 'Tamamlandı',
  };
  return labels[status];
}

export function getStatusColor(status: SigningRequest['status']): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    partial: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[status];
}

// Debug helper for external use
export function debugStorage(): void {
  console.log('=== Pakethane Panel Storage DEBUG ===');
  console.log('STORAGE_KEY:', STORAGE_KEY);

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    console.log('Raw data:', data);

    if (data) {
      const parsed = JSON.parse(data);
      console.log('Parsed:', parsed);
      console.log('Tokens:', Object.keys(parsed));
      console.log('Request count:', Object.keys(parsed).length);
    } else {
      console.log('No data in localStorage');
    }
  } catch (e) {
    console.error('Error reading storage:', e);
  }

  console.log('===========================');
}
