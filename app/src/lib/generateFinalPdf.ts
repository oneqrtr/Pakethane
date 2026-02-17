import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import type { SigningRequest } from '@/types';
import { getDocumentByCode } from '@/config/documentPack';
import { formatDate, toAsciiSafe } from './utils';

const PAGE_HEIGHT = 297;
const MARGIN = 20;
const IMG_MAX_WIDTH = 170;
const IMG_MAX_HEIGHT = 80;

/** Kullanıcı imza bilgilerini tek PDF halinde oluşturur. Dosya adı: "Ad Soyad TC.pdf" */
export async function generateFinalPdf(request: SigningRequest): Promise<void> {
  const doc = new jsPDF();
  let y = MARGIN;

  const addNewPage = () => {
    doc.addPage();
    y = MARGIN;
  };

  const checkSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) addNewPage();
  };

  // 1. Özet sayfası (jsPDF Türkçe desteklemez, ASCII'ye çeviriyoruz)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(toAsciiSafe('Imza Istegi Ozeti'), MARGIN, y);
  y += 14;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const statusText = request.status === 'pending' ? 'Beklemede' : request.status === 'partial' ? 'Kismi' : 'Tamamlandi';
  const info = [
    `Ad Soyad: ${toAsciiSafe(request.adSoyad || '-')}`,
    `E-posta: ${toAsciiSafe(request.email)}`,
    `TC Kimlik: ${request.tcKimlik || '-'}`,
    `Cep: ${request.cepNumarasi || '-'}`,
    `Istek Tarihi: ${toAsciiSafe(formatDate(request.createdAt))}`,
    `Bilgi Kayit Tarihi: ${request.savedAt ? toAsciiSafe(formatDate(request.savedAt)) : '-'}`,
    `Cihaz IP: ${request.ipAddress || '-'}`,
    `Durum: ${toAsciiSafe(statusText)}`,
  ];
  info.forEach((line) => {
    checkSpace(8);
    doc.text(line, MARGIN, y);
    y += 8;
  });
  y += 12;

  // 2. Imzalanan belgeler
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(toAsciiSafe('Imzalanan Belgeler'), MARGIN, y);
  y += 15;

  const taxPlatePdfBytes: Uint8Array[] = [];

  for (const docCode of request.selectedDocs) {
    const docDef = getDocumentByCode(docCode);
    const sig = request.signatures[docCode];

    checkSpace(100);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(toAsciiSafe(docDef?.title || docCode), MARGIN, y);
    y += 7;

    if (sig) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Imza tarihi: ${toAsciiSafe(formatDate(sig.signedAt))}`, MARGIN, y);
      y += 10;

      if ((docDef?.type === 'contract' || !docDef?.type) && sig.signaturePng) {
        try {
          checkSpace(60);
          doc.addImage(sig.signaturePng, 'PNG', MARGIN, y, 120, 40);
          y += 50;
        } catch {
          doc.text('[Imza]', MARGIN, y);
          y += 12;
        }
      }

      if ((docDef?.type === 'identity_card' || docDef?.type === 'driver_license') && (sig.frontImage || sig.backImage)) {
        for (const img of [sig.frontImage, sig.backImage].filter(Boolean) as string[]) {
          try {
            checkSpace(110);
            const fmt = img.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
            doc.addImage(img, fmt, MARGIN, y, IMG_MAX_WIDTH, IMG_MAX_HEIGHT);
            y += 90;
          } catch {
            doc.text('[Gorsel]', MARGIN, y);
            y += 15;
          }
        }
      }

      if (docDef?.type === 'tax_plate' && sig.taxPlatePdf) {
        try {
          const b64 = sig.taxPlatePdf.replace(/^data:application\/pdf;base64,/, '');
          taxPlatePdfBytes.push(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
        } catch {
          doc.text('[Vergi Levhasi PDF]', MARGIN, y);
          y += 12;
        }
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text(toAsciiSafe('Henuz imzalanmadi'), MARGIN, y);
      y += 10;
    }
    y += 12;
  }

  // Ana PDF bytes
  const mainPdfBytes = doc.output('arraybuffer');

  // Vergi levhası PDF'lerini birleştir
  let finalBytes: Uint8Array;
  if (taxPlatePdfBytes.length > 0) {
    const mainPdf = await PDFDocument.load(mainPdfBytes);
    for (const tp of taxPlatePdfBytes) {
      const tpPdf = await PDFDocument.load(tp);
      const pages = await mainPdf.copyPages(tpPdf, tpPdf.getPageIndices());
      pages.forEach((p) => mainPdf.addPage(p));
    }
    finalBytes = await mainPdf.save();
  } else {
    finalBytes = new Uint8Array(mainPdfBytes);
  }

  const safeName = (request.adSoyad || 'Kullanici').replace(/[^\p{L}\s]/gu, '').trim() || 'Kullanici';
  const safeTc = (request.tcKimlik || '').replace(/\D/g, '') || '';
  const fileName = `${safeName} ${safeTc}.pdf`.replace(/\s+/g, ' ').trim();

  const blob = new Blob([new Uint8Array(finalBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
