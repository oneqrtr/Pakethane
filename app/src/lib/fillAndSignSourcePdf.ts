import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SigningRequest } from '@/types';
import { getDocumentByCode } from '@/config/documentPack';
import { SOURCE_PDF_PATH } from '@/config/documentPack';
import { PDF_FORM_FIELD_MAP, SIGNATURE_POSITION } from '@/config/pdfFormConfig';
import { formatDate, toAsciiSafe } from './utils';

/**
 * Kaynak PDF'i kullanıcı bilgileriyle doldurur ve imzaları ilgili sayfalara ekler.
 * - Form alanları: Kullanıcı verisi -> PDF alan adı eşlemesi
 * - İmza: Kullanıcı/firma imza alanı karşısı veya sayfa numarasının (1/20) soluna
 */
export async function fillAndSignSourcePdf(
  request: SigningRequest,
  pdfUrl?: string
): Promise<void> {
  const url = pdfUrl || window.location.origin + SOURCE_PDF_PATH;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `PDF dosyası bulunamadı (404). Lütfen "${SOURCE_PDF_PATH}" dosyasını proje kökünde public/pdf/ klasörüne koyun.`
      );
    }
    throw new Error(`PDF yüklenemedi: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  // 1. Metin form alanlarını doldur (getForm bazı PDF'lerde hata verebilir)
  let form;
  try {
    form = pdfDoc.getForm();
    const fieldValues: Record<string, string> = {
      adSoyad: request.adSoyad || '',
      email: request.email || '',
      tcKimlik: request.tcKimlik || '',
      cepNumarasi: request.cepNumarasi || '',
      adres: '',
    };

    for (const [userKey, pdfFieldName] of Object.entries(PDF_FORM_FIELD_MAP)) {
      const value = fieldValues[userKey];
      if (!value) continue;
      try {
        const tf = form.getTextField(pdfFieldName);
        tf.setText(value);
      } catch {
        /* alan yoksa veya tip farklıysa geç */
      }
    }
  } catch {
    /* Form yok veya XFA/AcroForm uyumsuzluğu - devam et */
  }

  // 1b. İlk sayfaya kullanıcı bilgisi + tarih + IP blokunu ekle (kanıt için)
  if (pages.length > 0) {
    try {
      const firstPage = pages[0];
      const { height } = firstPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 8;
      const lineHeight = 10;
      const x = 50;
      let y = height - 40;
      const lines = [
        `Bilgi Kayit Tarihi: ${request.savedAt ? toAsciiSafe(formatDate(request.savedAt)) : '-'}`,
        `Istek Tarihi: ${toAsciiSafe(formatDate(request.createdAt))}`,
        `Cihaz IP: ${request.ipAddress || '-'}`,
      ];
      for (const line of lines) {
        firstPage.drawText(line, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
        y -= lineHeight;
      }
    } catch {
      /* bilgi bloğu eklenemezse devam et */
    }
  }

  // 2. Her imzalanan sözleşme için imzayı ilgili sayfanın sonuna ekle
  for (const docCode of request.selectedDocs) {
    const docDef = getDocumentByCode(docCode);
    const sig = request.signatures[docCode];
    if (!docDef || (docDef.type !== 'contract' && !docDef.type) || !sig?.signaturePng) continue;

    const lastPageIndex = (docDef.endPage ?? docDef.startPage ?? 1) - 1;
    if (lastPageIndex < 0 || lastPageIndex >= pages.length) continue;

    const page = pages[lastPageIndex];

    try {
      const base64 = sig.signaturePng.replace(/^data:image\/\w+;base64,/, '');
      const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const pngImage = await pdfDoc.embedPng(imgBytes);

      // PDF koordinatları: (0,0) sol alt. İmza sayfa numarasının soluna (footer bölgesi)
      page.drawImage(pngImage, {
        x: SIGNATURE_POSITION.x,
        y: SIGNATURE_POSITION.y,
        width: SIGNATURE_POSITION.width,
        height: SIGNATURE_POSITION.height,
      });
    } catch {
      /* imza eklenemezse geç */
    }
  }

  // 3. Vergi levhası PDF'lerini sona ekle
  for (const docCode of request.selectedDocs) {
    const docDef = getDocumentByCode(docCode);
    const sig = request.signatures[docCode];
    if (docDef?.type !== 'tax_plate' || !sig?.taxPlatePdf) continue;

    try {
      const b64 = sig.taxPlatePdf.replace(/^data:application\/pdf;base64,/, '');
      const tpBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const tpPdf = await PDFDocument.load(tpBytes, { ignoreEncryption: true });
      const copied = await pdfDoc.copyPages(tpPdf, tpPdf.getPageIndices());
      copied.forEach((p) => pdfDoc.addPage(p));
    } catch {
      /* vergi levhası eklenemezse geç */
    }
  }

  const bytes = await pdfDoc.save();
  const safeName = (request.adSoyad || 'Kullanici').replace(/[^\p{L}\s]/gu, '').trim() || 'Kullanici';
  const safeTc = (request.tcKimlik || '').replace(/\D/g, '') || '';
  const fileName = `${safeName} ${safeTc}.pdf`.replace(/\s+/g, ' ').trim();

  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const urlObj = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlObj;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(urlObj);
}
