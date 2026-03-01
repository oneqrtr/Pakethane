import type { DocumentDefinition } from '@/types';
// HTML belgeler: değişkenler {{adSoyad}}, {{vergiDairesiVkn}}, {{adres}}, {{email}}, {{tarih}} + imza placeholder
import franchiseSozlesmesiHtml from '@/config/contracts/franchiseSozlesmesi.html?raw';
import fikriSinaiHaklarHtml from '@/config/contracts/fikriSinaiHaklarSozlesmesi.html?raw';
import ekHizmetSozlesmesiHtml from '@/config/contracts/ekHizmetSozlesmesi.html?raw';
import ekKvkSozlesmesiHtml from '@/config/contracts/ekKvkSozlesmesi.html?raw';
import ekGizlilikSozlesmesiHtml from '@/config/contracts/ekGizlilikSozlesmesi.html?raw';
import kaliteStandartlariTaahhutnamesiHtml from '@/config/contracts/kaliteStandartlariTaahhutnamesi.html?raw';
import calismaPrensipleriDisiplinTalimatiHtml from '@/config/contracts/calismaPrensipleriDisiplinTalimati.html?raw';
import hizmetVerenlerKvkkAydinlatmaHtml from '@/config/contracts/hizmetVerenlerKvkkAydinlatma.html?raw';
import bTipiTasitKiralamaHtml from '@/config/contracts/bTipiTasitKiralamaSozlesmesi.html?raw';
import ek1BTipiTasitKiralamaHtml from '@/config/contracts/ek1BTipiTasitKiralamaOdemeDetaylari.html?raw';
import ek3FirmaCalisaniTasitSurucusuHtml from '@/config/contracts/ek3FirmaCalisaniTasitSurucusu.html?raw';
import kisiKoruyucuMalzemeTeslimTutanagiHtml from '@/config/contracts/kisiKoruyucuMalzemeTeslimTutanagi.html?raw';

// Document Pack Configuration
export const KKD_TESLIM_TUTANAGI_CODE = 'KKD_TESLIM_TUTANAGI';
export const FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI_CODE = 'FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI';
export const DOCUMENT_PACK: DocumentDefinition[] = [
  {
    code: 'FRANCHISE_SOZLESMESI',
    title: 'Paket Taşıma / Dağıtım / Teslimat Hizmeti Franchise Sözleşmesi',
    description: 'Pakethane Lojistik franchise sözleşmesi',
    order: 0,
    type: 'contract',
    contentHtml: franchiseSozlesmesiHtml,
  },
  {
    code: 'FRANCHISE_EK_FIKRI_SINAI_HAKLAR',
    title: 'Franchise Sözleşmesine Ek Fikri ve Sınai Haklara İlişkin Sözleşme',
    description: 'Fikri ve sınai haklar ek sözleşmesi',
    order: 0.5,
    type: 'contract',
    contentHtml: fikriSinaiHaklarHtml,
  },
  {
    code: 'FRANCHISE_EK_HIZMET_SOZLESMESI',
    title: 'Franchise Sözleşmesine Ek Hizmet Sözleşmesi',
    description: 'Paket taşıma / dağıtım / teslimat hizmeti ek sözleşmesi',
    order: 0.6,
    type: 'contract',
    contentHtml: ekHizmetSozlesmesiHtml,
  },
  {
    code: 'FRANCHISE_EK_KVK_SOZLESMESI',
    title: 'Franchise Sözleşmesine Ek Kişisel Verilerin Korunması Hakkında Sözleşme',
    description: 'KVK ek sözleşmesi',
    order: 0.7,
    type: 'contract',
    contentHtml: ekKvkSozlesmesiHtml,
  },
  {
    code: 'FRANCHISE_EK_GIZLILIK_SOZLESMESI',
    title: 'Franchise Sözleşmesine Ek Gizlilik Hakkında Sözleşme',
    description: 'Gizlilik ek sözleşmesi',
    order: 0.8,
    type: 'contract',
    contentHtml: ekGizlilikSozlesmesiHtml,
  },
  {
    code: 'FRANCHISE_KALITE_STANDARTLARI_TAAHHUTNAMESI',
    title: 'Pakethane Lojistik Kalite Standartları Taahhütnamesi',
    description: 'Kalite standartları taahhütnamesi',
    order: 0.9,
    type: 'contract',
    contentHtml: kaliteStandartlariTaahhutnamesiHtml,
  },
  {
    code: 'CALISMA_PRENSIPLERI_DISCIPLIN_TALIMATI',
    title: 'Çalışma Prensipleri ve Disiplin Süreci Talimatı',
    description: 'Çalışma düzeni ve disiplin süreci talimatı',
    order: 0.95,
    type: 'contract',
    contentHtml: calismaPrensipleriDisiplinTalimatiHtml,
  },
  {
    code: 'HIZMET_VERENLER_KVKK_AYDINLATMA',
    title: 'Hizmet Verenlerin Kişisel Verilerinin İşlenmesine İlişkin Aydınlatma Metni',
    description: 'Hizmet verenlere yönelik KVKK aydınlatma ve açık rıza metni',
    order: 0.98,
    type: 'contract',
    contentHtml: hizmetVerenlerKvkkAydinlatmaHtml,
  },
  {
    code: 'FRANCHISE_EK_B_TIPI_TASIT_KIRALAMA',
    title: 'Franchise Sözleşmesine Ek B Tipi Taşıt Kiralama Sözleşmesi',
    description: 'B tipi taşıt (motosiklet) kiralama sözleşmesi',
    order: 0.99,
    type: 'contract',
    contentHtml: bTipiTasitKiralamaHtml,
  },
  {
    code: 'FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI',
    title: 'EK-1 B Tipi Taşıt Kiralama Sözleşmesi Ödeme Detayları',
    description: 'Kiralama ödeme detayları ve araç bilgileri',
    order: 0.995,
    type: 'contract',
    contentHtml: ek1BTipiTasitKiralamaHtml,
  },
  {
    code: 'FRANCHISE_EK_B_TIPI_EK3_SURUCU_BILGILERI',
    title: 'EK-3 Firma Çalışanı Taşıt Sürücüsüne İlişkin Bilgiler',
    description: 'Kiralanan aracı kullanacak sürücü bilgileri',
    order: 0.998,
    type: 'contract',
    contentHtml: ek3FirmaCalisaniTasitSurucusuHtml,
  },
  {
    code: 'KKD_TESLIM_TUTANAGI',
    title: 'Kişisel Koruyucu Malzeme Teslim Tutanağı',
    description: 'KKD teslim alındı tutanağı (checkbox\'lı)',
    order: 0.9985,
    type: 'contract',
    contentHtml: kisiKoruyucuMalzemeTeslimTutanagiHtml,
  },
  {
    code: 'ADLI_SICIL_KAYDI',
    title: 'Adli Sicil Kaydı',
    description: 'Güncel ve fotoğraf olarak eklenebilir, verileceği yer kısmına Pakethane yazılmalıdır.',
    order: 10.5,
    type: 'criminal_record',
  },
  {
    code: 'EHLIYET',
    title: 'Sürücü Belgesi',
    description: 'Geçerli ve önlü arkalı fotoğraf olarak yüklenmelidir.',
    order: 10.6,
    type: 'driver_license',
  },
  {
    code: 'VERGI_LEVHASI',
    title: 'Vergi Levhası',
    description: 'Faaliyet kodlu, fotoğraf veya PDF formatında olmalıdır.',
    order: 10.7,
    type: 'tax_plate',
  },
  {
    code: 'IKAMETGAH_BELGESI',
    title: 'İkametgah Belgesi',
    description: 'e-devletten alınmalı, güncel ve fotoğraf veya PDF formatında olmalıdır.',
    order: 10.8,
    type: 'residence',
  },
  {
    code: 'KIMLIK_KARTI',
    title: 'Kimlik Fotokopisi',
    description: 'Fotoğraf olarak önlü arkalı eklenmelidir.',
    order: 10.9,
    type: 'identity_card',
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
