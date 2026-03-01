import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { SigningRequest } from '@/types';
import { SIGNATURE_PLACEHOLDER_ID } from '@/types';
import { getDocumentByCode } from '@/config/documentPack';
import { injectVariablesIntoHtml, kkdRowsToVariables } from './htmlContractVariables';

const SIGNATURE_PLACEHOLDER_REGEX = new RegExp(
  `<div\\s+id="${SIGNATURE_PLACEHOLDER_ID}"[^>]*>\\s*</div>`,
  'is'
);

function injectSignatureIntoHtml(html: string, signatureDataUrl: string | null): string {
  if (!signatureDataUrl) return html;
  const signedBlock = `<div id="${SIGNATURE_PLACEHOLDER_ID}" class="signature-box"><img src="${signatureDataUrl}" alt="İmza" class="signature-img" style="max-width:180px;max-height:70px;object-fit:contain;" /></div>`;
  return html.replace(SIGNATURE_PLACEHOLDER_REGEX, signedBlock);
}

/**
 * İstek ve imza ile HTML belgeyi doldurur (admin veya önizleme için).
 * formData.kkdRows varsa KKD Teslim Tutanağı için "Teslim Aldım" sütununa ✓ ve Tarih sütununa imza tarihi yazılır.
 */
export function getFilledSignedHtml(
  contentHtml: string,
  request: SigningRequest,
  signaturePng: string | null,
  formData?: { kkdRows?: number[] },
  signedAt?: string
): string {
  const tarih = (request.createdAt
    ? new Date(request.createdAt)
    : new Date()
  ).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const imzaTarihi = signedAt
    ? new Date(signedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : tarih;
  let html = injectVariablesIntoHtml(contentHtml, {
    adSoyad: request.adSoyad ?? '',
    vergiDairesiVkn: request.tcKimlik ?? '',
    tcKimlik: request.tcKimlik ?? '',
    adres: request.adres ?? '',
    email: request.email ?? '',
    tarih,
    cepTelefonu: request.cepNumarasi ?? '',
    surucuBelgesiTarihi: request.surucuBelgesiTarihi ?? '',
    surucuSicilNo: request.surucuSicilNo ?? '',
    plaka: request.ek1Plaka ?? '',
    markaModel: request.ek1MarkaModel ?? '',
    modelYili: request.ek1ModelYili ?? '',
    sasiNo: request.ek1SasiNo ?? '',
    motorNo: request.ek1MotorNo ?? '',
    ...kkdRowsToVariables(formData?.kkdRows, imzaTarihi),
  });
  return injectSignatureIntoHtml(html, signaturePng);
}

const PDF_PAGE_W_MM = 210;
const PDF_PAGE_H_MM = 297;
const HTML_RENDER_WIDTH_PX = 794;

/**
 * İmzalı HTML belgeleri tarayıcıda html2canvas + jsPDF ile tek PDF yapar (API gerekmez).
 */
export async function downloadSignedHtmlDocsAsPdf(request: SigningRequest): Promise<void> {
  const signedHtmlDocs: { docCode: string; html: string }[] = [];
  for (const docCode of request.selectedDocs) {
    const doc = getDocumentByCode(docCode);
    const sig = request.signatures[docCode];
    if (!doc?.contentHtml || !sig?.signaturePng) continue;
    const html = getFilledSignedHtml(doc.contentHtml, request, sig.signaturePng, sig.formData, sig.signedAt);
    signedHtmlDocs.push({ docCode, html });
  }
  if (signedHtmlDocs.length === 0) {
    throw new Error('İndirilecek imzalı HTML belge yok.');
  }

  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${HTML_RENDER_WIDTH_PX}px;background:white;padding:16px;box-sizing:border-box;`;
  container.innerHTML = '<div class="belge-html" style="font-family:system-ui,sans-serif;font-size:11px;color:#222;"></div>';
  const inner = container.querySelector('.belge-html') as HTMLElement;
  if (!inner) throw new Error('Container setup failed');
  document.body.appendChild(container);

  const pdf = new jsPDF('p', 'mm', 'a4');
  let isFirstPage = true;

  try {
    for (const { html } of signedHtmlDocs) {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(html, 'text/html');
      inner.innerHTML = parsed.body?.innerHTML ?? html;
      inner.style.width = `${HTML_RENDER_WIDTH_PX - 32}px`;

      await new Promise((r) => setTimeout(r, 400));

      const canvas = await html2canvas(inner, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgW = canvas.width;
      const imgH = canvas.height;
      const scale = PDF_PAGE_W_MM / (imgW / 2);
      const scaledHmm = (imgH / 2) * scale;
      const dataUrl = canvas.toDataURL('image/png');

      if (scaledHmm <= PDF_PAGE_H_MM) {
        if (!isFirstPage) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, PDF_PAGE_W_MM, scaledHmm);
        isFirstPage = false;
      } else {
        const segmentHpx = (PDF_PAGE_H_MM / scale) * 2;
        let y = 0;
        while (y < imgH) {
          if (!isFirstPage) pdf.addPage();
          const h = Math.min(segmentHpx, imgH - y);
          const segCanvas = document.createElement('canvas');
          segCanvas.width = imgW;
          segCanvas.height = h;
          const ctx = segCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, y, imgW, h, 0, 0, imgW, h);
            const segUrl = segCanvas.toDataURL('image/png');
            const segHmm = (h / 2) * scale;
            pdf.addImage(segUrl, 'PNG', 0, 0, PDF_PAGE_W_MM, segHmm);
          }
          y += segmentHpx;
          isFirstPage = false;
        }
      }
    }

    const safeName = (request.adSoyad || 'Kullanici').replace(/[^\p{L}\s]/gu, '').trim() || 'Kullanici';
    pdf.save(`Imzali_Belgeler_${safeName}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

/** İstekte imzalı HTML belge var mı? */
export function hasSignedHtmlDocs(request: SigningRequest): boolean {
  return request.selectedDocs.some((docCode) => {
    const doc = getDocumentByCode(docCode);
    const sig = request.signatures[docCode];
    return !!doc?.contentHtml && !!sig?.signaturePng;
  });
}
