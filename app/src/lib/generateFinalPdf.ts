import { jsPDF } from 'jspdf';
import type { SigningRequest } from '@/types';
import { getDocumentByCode } from '@/config/documentPack';
import { formatDate, toAsciiSafe } from './utils';

const PAGE_HEIGHT = 297;
const MARGIN = 14;
const COL2_X = 110;

/**
 * Özet PDF: Tek sayfa, canlı imza için. Kullanıcı bilgileri (adres, sürücü sicil no, kimlik fotoğrafı dahil) + imzalanan sözleşme isimleri ve imzalar.
 */
export async function generateFinalPdf(request: SigningRequest): Promise<void> {
  const doc = new jsPDF();
  let y = MARGIN;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(toAsciiSafe('Imza Istegi Ozeti (Canli imza icin)'), MARGIN, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const statusText = request.status === 'pending' ? 'Beklemede' : request.status === 'partial' ? 'Kismi' : 'Tamamlandi';
  const info = [
    `Ad Soyad: ${toAsciiSafe(request.adSoyad || '-')}   E-posta: ${toAsciiSafe(request.email)}   TC: ${request.tcKimlik || '-'}   Cep: ${request.cepNumarasi || '-'}`,
    `Adres: ${toAsciiSafe((request.adres || '-').slice(0, 70))}${(request.adres?.length ?? 0) > 70 ? '...' : ''}`,
    `Istek: ${toAsciiSafe(formatDate(request.createdAt))}   Bilgi Kayit: ${request.savedAt ? toAsciiSafe(formatDate(request.savedAt)) : '-'}   Surucu Sicil No: ${request.surucuSicilNo || '-'}   IP: ${request.ipAddress || '-'}   Durum: ${toAsciiSafe(statusText)}`,
  ];
  info.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 4;

  const kimlikDocCode = request.selectedDocs.find((code) => getDocumentByCode(code)?.type === 'identity_card');
  const kimlikSig = kimlikDocCode ? request.signatures[kimlikDocCode] : undefined;
  if (kimlikSig?.frontImage || kimlikSig?.backImage) {
    doc.setFont('helvetica', 'bold');
    doc.text(toAsciiSafe('Kimlik fotografi'), MARGIN, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const idImgW = 28;
    const idImgH = 20;
    if (kimlikSig.frontImage) {
      try {
        doc.addImage(kimlikSig.frontImage, kimlikSig.frontImage.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', MARGIN, y, idImgW, idImgH);
        doc.text('On', MARGIN, y + idImgH + 3);
      } catch {
        doc.text('[On yuz]', MARGIN, y + 4);
      }
    }
    if (kimlikSig.backImage) {
      try {
        doc.addImage(kimlikSig.backImage, kimlikSig.backImage.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', MARGIN + idImgW + 4, y, idImgW, idImgH);
        doc.text('Arka', MARGIN + idImgW + 4, y + idImgH + 3);
      } catch {
        doc.text('[Arka yuz]', MARGIN + idImgW + 4, y + 4);
      }
    }
    y += idImgH + 10;
  }

  y += 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(toAsciiSafe('Imzalanan Sozlesmeler'), MARGIN, y);
  y += 8;

  const contractEntries: { title: string; signedAt: string; signaturePng: string }[] = [];
  for (const docCode of request.selectedDocs) {
    const docDef = getDocumentByCode(docCode);
    const sig = request.signatures[docCode];
    const isContract = docDef?.type === 'contract' || !docDef?.type;
    if (!isContract || !sig?.signaturePng) continue;
    contractEntries.push({
      title: docDef?.title || docCode,
      signedAt: formatDate(sig.signedAt),
      signaturePng: sig.signaturePng,
    });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const imgH = 12;
  const imgW = 36;
  for (const entry of contractEntries) {
    if (y + imgH > PAGE_HEIGHT - MARGIN) break;
    const titleShort = toAsciiSafe(entry.title).slice(0, 52);
    doc.text(`${titleShort}`, MARGIN, y + 4);
    doc.text(`Tarih: ${toAsciiSafe(entry.signedAt)}`, MARGIN, y + 10);
    try {
      doc.addImage(entry.signaturePng, 'PNG', COL2_X, y, imgW, imgH);
    } catch {
      doc.text('[Imza]', COL2_X, y + 4);
    }
    y += imgH + 4;
  }

  const safeName = (request.adSoyad || 'Kullanici').replace(/[^\p{L}\s]/gu, '').trim() || 'Kullanici';
  const safeTc = (request.tcKimlik || '').replace(/\D/g, '') || '';
  const fileName = `${safeName} ${safeTc}_Ozet.pdf`.replace(/\s+/g, ' ').trim();

  const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
