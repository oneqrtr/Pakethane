/**
 * HTML belge şablonlarındaki metin değişkenleri.
 * Şablonda {{adSoyad}}, {{email}}, {{tarih}} gibi placeholder'lar bu değerlerle değiştirilir.
 */
export type HtmlContractVariables = {
  adSoyad?: string;
  /** Vergi Dairesi / VKN / TC Kimlik */
  vergiDairesiVkn?: string;
  tcKimlik?: string;
  adres?: string;
  email?: string;
  /** İmza tarihi (örn. 17.02.2026) */
  tarih?: string;
  /** Cep telefonu (EK-3 vb.) */
  cepTelefonu?: string;
  /** Sürücü belgesi veriliş tarihi (EK-3) */
  surucuBelgesiTarihi?: string;
  /** Sürücü sicil numarası (EK-3) */
  surucuSicilNo?: string;
  /** KKD Teslim Tutanağı: satır N teslim alındı ise "✓" (kkdRow1..kkdRow10) */
  kkdRow1?: string;
  kkdRow2?: string;
  kkdRow3?: string;
  kkdRow4?: string;
  kkdRow5?: string;
  kkdRow6?: string;
  kkdRow7?: string;
  kkdRow8?: string;
  kkdRow9?: string;
  kkdRow10?: string;
  /** KKD Teslim Tutanağı: satır N için Tarih sütunu (sadece teslim alındı işaretli satırlarda imza tarihi) */
  kkdRow1Tarih?: string;
  kkdRow2Tarih?: string;
  kkdRow3Tarih?: string;
  kkdRow4Tarih?: string;
  kkdRow5Tarih?: string;
  kkdRow6Tarih?: string;
  kkdRow7Tarih?: string;
  kkdRow8Tarih?: string;
  kkdRow9Tarih?: string;
  kkdRow10Tarih?: string;
  /** EK-1 B Tipi Ödeme Detayları: motosiklet bilgileri */
  plaka?: string;
  markaModel?: string;
  modelYili?: string;
  sasiNo?: string;
  motorNo?: string;
};

const VAR_PATTERN = /\{\{(\w+)\}\}/g;

/** kkdRows [1,2,3] => { kkdRow1: '✓', ..., kkdRow1Tarih: imzaTarihi, ... }; teslim alındı işaretli satırlarda Tarih sütununa imzaTarihi yazılır. */
export function kkdRowsToVariables(
  kkdRows: number[] | undefined,
  imzaTarihi?: string
): Record<string, string> {
  const set = new Set(kkdRows ?? []);
  const out: Record<string, string> = {};
  const tarih = imzaTarihi ?? '';
  for (let i = 1; i <= 10; i++) {
    out[`kkdRow${i}`] = set.has(i) ? '✓' : '';
    out[`kkdRow${i}Tarih`] = set.has(i) ? tarih : '';
  }
  return out;
}

/**
 * HTML içindeki {{değişkenAdı}} ifadelerini verilen değerlerle değiştirir.
 * Eşleşmeyen key'ler boş string yapılır.
 */
export function injectVariablesIntoHtml(
  html: string,
  variables: HtmlContractVariables
): string {
  const map: Record<string, string> = {
    adSoyad: variables.adSoyad ?? '',
    vergiDairesiVkn: variables.vergiDairesiVkn ?? variables.tcKimlik ?? '',
    tcKimlik: variables.tcKimlik ?? variables.vergiDairesiVkn ?? '',
    adres: variables.adres ?? '',
    email: variables.email ?? '',
    tarih: variables.tarih ?? '',
    cepTelefonu: variables.cepTelefonu ?? '',
    surucuBelgesiTarihi: variables.surucuBelgesiTarihi ?? '',
    surucuSicilNo: variables.surucuSicilNo ?? '',
    kkdRow1: variables.kkdRow1 ?? '',
    kkdRow2: variables.kkdRow2 ?? '',
    kkdRow3: variables.kkdRow3 ?? '',
    kkdRow4: variables.kkdRow4 ?? '',
    kkdRow5: variables.kkdRow5 ?? '',
    kkdRow6: variables.kkdRow6 ?? '',
    kkdRow7: variables.kkdRow7 ?? '',
    kkdRow8: variables.kkdRow8 ?? '',
    kkdRow9: variables.kkdRow9 ?? '',
    kkdRow10: variables.kkdRow10 ?? '',
    kkdRow1Tarih: variables.kkdRow1Tarih ?? '',
    kkdRow2Tarih: variables.kkdRow2Tarih ?? '',
    kkdRow3Tarih: variables.kkdRow3Tarih ?? '',
    kkdRow4Tarih: variables.kkdRow4Tarih ?? '',
    kkdRow5Tarih: variables.kkdRow5Tarih ?? '',
    kkdRow6Tarih: variables.kkdRow6Tarih ?? '',
    kkdRow7Tarih: variables.kkdRow7Tarih ?? '',
    kkdRow8Tarih: variables.kkdRow8Tarih ?? '',
    kkdRow9Tarih: variables.kkdRow9Tarih ?? '',
    kkdRow10Tarih: variables.kkdRow10Tarih ?? '',
    plaka: variables.plaka ?? '',
    markaModel: variables.markaModel ?? '',
    modelYili: variables.modelYili ?? '',
    sasiNo: variables.sasiNo ?? '',
    motorNo: variables.motorNo ?? '',
  };
  return html.replace(VAR_PATTERN, (_, key) => map[key] ?? '');
}
