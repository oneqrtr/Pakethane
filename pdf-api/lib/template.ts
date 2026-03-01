import type { ContractData } from './schema';
import { escapeHtml } from './escape';

const A4_CSS = `
@page { size: A4; margin: 18mm; }
body { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.5; color: #222; margin: 0; padding: 0; }
.page-break { page-break-after: always; }
.no-break { page-break-inside: avoid; }
.signature-img { max-width: 120px; max-height: 50px; object-fit: contain; }
h1 { font-size: 16px; margin: 0 0 12px 0; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f5f5f5; }
`;

export function renderContractHtml(data: ContractData): string {
  const adSoyad = escapeHtml(data.adSoyad ?? '');
  const email = escapeHtml(data.email);
  const tcKimlik = escapeHtml(data.tcKimlik ?? '');
  const cepNumarasi = escapeHtml(data.cepNumarasi ?? '');
  const adres = escapeHtml(data.adres ?? '');
  const tarih = escapeHtml(data.tarih ?? '');

  const signatureSrc =
    data.signaturePng && data.signaturePng.length > 0
      ? data.signaturePng.startsWith('data:')
        ? data.signaturePng
        : `data:image/png;base64,${data.signaturePng}`
      : '';

  const signatureImg = signatureSrc
    ? `<img src="${signatureSrc}" alt="Imza" class="signature-img" />`
    : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <style>${A4_CSS}</style>
</head>
<body>
  <h1>Sozlesme Ozeti</h1>
  <table class="no-break">
    <tr><th>Ad Soyad</th><td>${adSoyad}</td></tr>
    <tr><th>E-posta</th><td>${email}</td></tr>
    <tr><th>TC Kimlik</th><td>${tcKimlik}</td></tr>
    <tr><th>Cep Numarasi</th><td>${cepNumarasi}</td></tr>
    <tr><th>Adres</th><td>${adres}</td></tr>
    <tr><th>Tarih</th><td>${tarih}</td></tr>
  </table>
  <div class="no-break">
    <p><strong>Imza:</strong></p>
    ${signatureImg || '<p>-</p>'}
  </div>
</body>
</html>`;
}
