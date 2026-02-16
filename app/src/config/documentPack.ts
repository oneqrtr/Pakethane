import type { DocumentDefinition } from '@/types';

// Document Pack Configuration
export const DOCUMENT_PACK: DocumentDefinition[] = [
  {
    code: 'KVKK_AYDINLATMA',
    title: 'KVKK Aydınlatma Metni',
    description: 'Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni',
    startPage: 1,
    endPage: 2,
    order: 1,
    type: 'contract',
  },
  {
    code: 'GIZLILIK_SOZLESMESI',
    title: 'Gizlilik Sözleşmesi',
    description: 'Şirket gizlilik politikası ve taahhütname',
    startPage: 3,
    endPage: 4,
    order: 2,
    type: 'contract',
  },
  {
    code: 'KURYE_SOZLESMESI',
    title: 'Kurye Hizmet Sözleşmesi',
    description: 'Kurye hizmetleri kapsamında çalışma şartları ve sözleşme',
    startPage: 5,
    endPage: 7,
    order: 3,
    type: 'contract',
  },
  {
    code: 'ARAC_KULLANIM_SOZLESMESI',
    title: 'Araç Kullanım Sözleşmesi',
    description: 'Şirket aracı kullanım kuralları ve sorumluluklar',
    startPage: 8,
    endPage: 9,
    order: 4,
    type: 'contract',
  },
  {
    code: 'IS_GUVENLIGI_TAAHHUTNAMESI',
    title: 'İş Güvenliği Taahhütnamesi',
    description: 'İş güvenliği kurallarına uyum taahhütnamesi',
    startPage: 10,
    endPage: 11,
    order: 5,
    type: 'contract',
  },
  {
    code: 'VERGI_SORUMLULUK_TAAHHUTNAMESI',
    title: 'Vergi Sorumluluk Taahhütnamesi',
    description: 'Vergi yükümlülükleri ve sorumluluk beyanı',
    startPage: 12,
    endPage: 13,
    order: 6,
    type: 'contract',
  },
  {
    code: 'SGK_BEYANI',
    title: 'SGK Beyan Formu',
    description: 'Sosyal Güvenlik Kurumu beyan ve taahhüt formu',
    startPage: 14,
    endPage: 15,
    order: 7,
    type: 'contract',
  },
  {
    code: 'ELEKTRONIK_IZIN_FORMU',
    title: 'Elektronik İletişim İzin Formu',
    description: 'Elektronik iletişim ve pazarlama izni formu',
    startPage: 16,
    endPage: 16,
    order: 8,
    type: 'contract',
  },
  {
    code: 'UYUSMAZLIK_COZUM_SOZLESMESI',
    title: 'Uyuşmazlık Çözüm Sözleşmesi',
    description: 'İş uyuşmazlıklarında çözüm mekanizması sözleşmesi',
    startPage: 17,
    endPage: 18,
    order: 9,
    type: 'contract',
  },
  {
    code: 'AYRILMA_PROTOKOLU',
    title: 'Ayrılma Protokolü',
    description: 'İş ilişkisi sonlandırma şartları ve protokol',
    startPage: 19,
    endPage: 20,
    order: 10,
    type: 'contract',
  },
  {
    code: 'KIMLIK_KARTI',
    title: 'Kimlik Kartı',
    description: 'Ön ve arka yüz fotoğraf yüklemesi',
    order: 11,
    type: 'identity_card',
  },
  {
    code: 'EHLIYET',
    title: 'Ehliyet',
    description: 'Ön ve arka yüz fotoğraf yüklemesi',
    order: 12,
    type: 'driver_license',
  },
  {
    code: 'VERGI_LEVHASI',
    title: 'Vergi Levhası',
    description: 'PDF formatında yükleme',
    order: 13,
    type: 'tax_plate',
  },
];

export function getDocumentByCode(code: string): DocumentDefinition | undefined {
  return DOCUMENT_PACK.find((doc) => doc.code === code);
}

export function getAllDocumentCodes(): string[] {
  return DOCUMENT_PACK.map((doc) => doc.code);
}

export function getDocumentsByCodes(codes: string[]): DocumentDefinition[] {
  return DOCUMENT_PACK.filter((doc) => codes.includes(doc.code)).sort(
    (a, b) => a.order - b.order
  );
}

export const SOURCE_PDF_PATH = '/pdf/pakethane-kurye-sozlesmeleri.pdf';
