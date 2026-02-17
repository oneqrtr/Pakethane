import { PDFDocument } from 'pdf-lib';

export interface PdfFormFieldInfo {
  name: string;
  type: string;
  pageIndex?: number;
}

export interface InspectPdfResult {
  hasForm: boolean;
  fieldCount: number;
  fields: PdfFormFieldInfo[];
  error?: string;
}

/**
 * PDF dosyasını yükleyip form alanlarını kontrol eder.
 * @param pdfUrl - PDF dosyasının URL'i (örn. /pdf/dosya.pdf)
 * @returns Form alanı bilgileri veya hata
 */
export async function inspectPdfFormFields(pdfUrl: string): Promise<InspectPdfResult> {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return { hasForm: false, fieldCount: 0, fields: [], error: `PDF yüklenemedi: ${response.status}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    const fieldInfos: PdfFormFieldInfo[] = [];

    for (const field of fields) {
      const name = field.getName();
      const type = field.constructor.name.replace('PDF', '').replace('Field', '');
      fieldInfos.push({
        name,
        type: type || 'Unknown',
      });
    }

    return {
      hasForm: fields.length > 0,
      fieldCount: fields.length,
      fields: fieldInfos,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      hasForm: false,
      fieldCount: 0,
      fields: [],
      error: `Kontrol hatası: ${message}`,
    };
  }
}
