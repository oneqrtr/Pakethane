// Types for Pakethane Kurye Lojistik + İmza Süreci

// --- Başvurular (Kurye ol / Kurye Hizmeti Al) ---
export type KuryeOlStatus = 'pending' | 'approved' | 'rejected';

export interface KuryeOlApplication {
  id: string;
  adSoyad: string;
  email: string;
  telefon: string;
  mesaj?: string;
  status: KuryeOlStatus;
  createdAt: string;
  updatedAt: string;
  /** Onaylandıktan sonra imza için oluşturulan token (SigningRequest) */
  signingRequestToken?: string;
}

export interface HizmetAlApplication {
  id: string;
  firmaAdi: string;
  yetkili: string;
  email: string;
  telefon: string;
  talep: string;
  createdAt: string;
}

// --- Referanslar (landing carousel logolar) ---
export interface Reference {
  id: string;
  title: string;
  logoUrl: string;
  link?: string;
  order: number;
}

// --- Blog (landing blog bölümü) ---
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  order: number;
}

// --- İmza süreci (mevcut) ---
export type DocumentType = 'contract' | 'identity_card' | 'driver_license' | 'tax_plate' | 'residence' | 'criminal_record';

/** HTML belgelerde imzanın konacağı div'in id'si; değiştirmeyin. */
export const SIGNATURE_PLACEHOLDER_ID = 'signature-placeholder';

export interface DocumentDefinition {
  code: string;
  title: string;
  description: string;
  startPage?: number;
  endPage?: number;
  order: number;
  type: DocumentType;
  /** Varsa bu belge HTML olarak gösterilir; imza placeholder'a yerleştirilir. */
  contentHtml?: string;
}

export interface DocumentSignature {
  docCode: string;
  signedAt: string;
  signaturePng?: string; // For contracts
  frontImage?: string;   // For identity/license
  backImage?: string;    // For identity/license
  taxPlatePdf?: string;  // For tax plate
  /** İkametgah / Adli Sicil: fotoğraf veya PDF (data URL) */
  uploadedDocument?: string;
  consentChecked?: boolean;
  formData?: {
    adSoyad?: string;
    tcKimlik?: string;
    /** KKD Teslim Tutanağı: teslim alındı işaretlenen satır numaraları (1-10) */
    kkdRows?: number[];
  };
}

export interface SigningRequest {
  token: string;
  email: string;
  adSoyad?: string;
  cepNumarasi?: string;
  tcKimlik?: string;
  adres?: string;
  /** EK-3 B Tipi Taşıt: Sürücü belgesi veriliş tarihi */
  surucuBelgesiTarihi?: string;
  /** EK-3 B Tipi Taşıt: Sürücü sicil numarası */
  surucuSicilNo?: string;
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
  /** EK-1 B Tipi Ödeme Detayları: admin tarafından gönderim öncesi doldurulabilir */
  ek1Plaka?: string;
  ek1MarkaModel?: string;
  ek1ModelYili?: string;
  ek1SasiNo?: string;
  ek1MotorNo?: string;
}

export interface CreateRequestInput {
  email: string;
  adSoyad?: string;
  selectedDocs: string[];
  /** EK-1 B Tipi Ödeme Detayları: admin doldurursa istek ile kaydedilir */
  ek1Plaka?: string;
  ek1MarkaModel?: string;
  ek1ModelYili?: string;
  ek1SasiNo?: string;
  ek1MotorNo?: string;
}

export interface SignDocumentInput {
  token: string;
  docCode: string;
  signaturePng?: string;
  frontImage?: string;
  backImage?: string;
  taxPlatePdf?: string;
  uploadedDocument?: string;
  consentChecked?: boolean;
  formData?: {
    adSoyad?: string;
    tcKimlik?: string;
    kkdRows?: number[];
  };
}
