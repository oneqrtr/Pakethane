// Types for the E-İmza Yönetim Sistemi

export type DocumentType = 'contract' | 'identity_card' | 'driver_license' | 'tax_plate';

export interface DocumentDefinition {
  code: string;
  title: string;
  description: string;
  startPage?: number;
  endPage?: number;
  order: number;
  type: DocumentType;
}

export interface DocumentSignature {
  docCode: string;
  signedAt: string;
  signaturePng?: string; // For contracts
  frontImage?: string;   // For identity/license
  backImage?: string;    // For identity/license
  taxPlatePdf?: string;  // For tax plate
  consentChecked?: boolean;
  formData?: {
    adSoyad?: string;
    tcKimlik?: string;
  };
}

export interface SigningRequest {
  token: string;
  email: string;
  adSoyad?: string;
  cepNumarasi?: string;
  tcKimlik?: string;
  userSignaturePng?: string;
  selectedDocs: string[];
  signatures: Record<string, DocumentSignature>;
  status: 'pending' | 'partial' | 'completed';
  createdAt: string;
  updatedAt: string;
  /** Kaydet tıklandığında: kullanıcı bilgileri ilk kaydedildiğinde */
  savedAt?: string;
  /** Kaydet tıklandığında: kullanıcının cihaz IP adresi */
  ipAddress?: string;
}

export interface CreateRequestInput {
  email: string;
  adSoyad?: string;
  selectedDocs: string[];
}

export interface SignDocumentInput {
  token: string;
  docCode: string;
  signaturePng?: string;
  frontImage?: string;
  backImage?: string;
  taxPlatePdf?: string;
  consentChecked?: boolean;
  formData?: {
    adSoyad?: string;
    tcKimlik?: string;
  };
}
