import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Save,
} from 'lucide-react';
import { mockStore } from '@/lib/store/mockStore';
import { getDocumentByCode } from '@/config/documentPack';
import type { SigningRequest } from '@/types';
import { SIGNATURE_PLACEHOLDER_ID } from '@/types';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { SignatureCanvas } from '@/components/signature/SignatureCanvas';
import { injectVariablesIntoHtml, kkdRowsToVariables } from '@/lib/htmlContractVariables';
import { KKD_TESLIM_TUTANAGI_CODE } from '@/config/documentPack';

/** Şablonda imzanın konacağı alan; boşluk farklarına toleranslı eşleşir. */
const SIGNATURE_PLACEHOLDER_REGEX = new RegExp(
  `<div\\s+id="${SIGNATURE_PLACEHOLDER_ID}"[^>]*>\\s*</div>`,
  'is'
);

function injectSignatureIntoHtml(html: string, signatureDataUrl: string | null): string {
  if (!signatureDataUrl) return html;
  const signedBlock = `<div id="${SIGNATURE_PLACEHOLDER_ID}" class="signature-box"><img src="${signatureDataUrl}" alt="İmza" class="signature-img" style="max-width:180px;max-height:70px;object-fit:contain;" /></div>`;
  return html.replace(SIGNATURE_PLACEHOLDER_REGEX, signedBlock);
}

/** HTML belgeyi istek/form verileri ve imza ile doldurur ({{adSoyad}}, {{tarih}} vb. + imza). KKD için teslim alındı işaretli satırlarda Tarih sütununa imzaTarihiForKkd yazılır. */
function getFilledHtml(
  contentHtml: string,
  request: SigningRequest | null,
  formAdSoyad: string,
  formTcKimlik: string,
  signatureDataUrl: string | null,
  kkdRows?: number[],
  imzaTarihiForKkd?: string
): string {
  const tarih = (request?.createdAt
    ? new Date(request.createdAt)
    : new Date()
  ).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const baseVars = {
    adSoyad: formAdSoyad || request?.adSoyad || '',
    vergiDairesiVkn: formTcKimlik || request?.tcKimlik || '',
    tcKimlik: formTcKimlik || request?.tcKimlik || '',
    adres: request?.adres ?? '',
    email: request?.email || '',
    tarih,
    cepTelefonu: request?.cepNumarasi ?? '',
    surucuBelgesiTarihi: request?.surucuBelgesiTarihi ?? '',
    surucuSicilNo: request?.surucuSicilNo ?? '',
    ...kkdRowsToVariables(kkdRows, imzaTarihiForKkd ?? tarih),
  };
  let html = injectVariablesIntoHtml(contentHtml, baseVars);
  return injectSignatureIntoHtml(html, signatureDataUrl);
}

export default function SignDocumentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const token = searchParams.get('token');
  const docCode = params.docCode as string;

  const [request, setRequest] = useState<SigningRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [consentChecked, setConsentChecked] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [adSoyad, setAdSoyad] = useState('');
  const [tcKimlik, setTcKimlik] = useState('');
  const [kkdRows, setKkdRows] = useState<number[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const document = getDocumentByCode(docCode);

  useEffect(() => {
    if (!token || !docCode) {
      setError('Geçersiz erişim linki.');
      setIsLoading(false);
      return;
    }

    loadRequest();
  }, [token, docCode]);

  const loadRequest = async () => {
    if (!token) return;

    setIsLoading(true);
    const data = await mockStore.getRequest(token);

    if (!data) {
      setError('İmza isteği bulunamadı.');
    } else if (!data.selectedDocs.includes(docCode)) {
      setError('Bu belge imza isteğinde bulunmuyor.');
    } else {
      setRequest(data);

      const existingSignature = data.signatures[docCode];
      setAdSoyad(
        existingSignature?.formData?.adSoyad ?? data.adSoyad ?? ''
      );
      setTcKimlik(
        existingSignature?.formData?.tcKimlik ?? data.tcKimlik ?? ''
      );
      setSignatureData(
        existingSignature?.signaturePng ?? data.userSignaturePng ?? null
      );
      if (existingSignature) {
        setConsentChecked(existingSignature.consentChecked ?? false);
        if (existingSignature.formData?.kkdRows) {
          setKkdRows(existingSignature.formData.kkdRows);
        }
      }
    }

    setIsLoading(false);
  };

  const handleSignatureChange = (data: string | null) => {
    setSignatureData(data);
  };

  const handleSubmit = async () => {
    if (!token || !docCode) return;

    if (!consentChecked) {
      alert('Lütfen "Okudum, anladım" onayını işaretleyin.');
      return;
    }

    if (!signatureData) {
      alert('Lütfen imzanızı çizin.');
      return;
    }

    setIsSubmitting(true);

    try {
      await mockStore.signDocument({
        token,
        docCode,
        signaturePng: signatureData,
        consentChecked,
        formData: {
          adSoyad: adSoyad || undefined,
          tcKimlik: tcKimlik || undefined,
          ...(docCode === KKD_TESLIM_TUTANAGI_CODE && kkdRows.length > 0 && { kkdRows }),
        },
      });

      setSubmitSuccess(true);
    } catch (error) {
      alert('İmza kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadySigned = request?.signatures?.[docCode] !== undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Hata</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document || !request) {
    return null;
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              İmza Kaydedildi!
            </h1>
            <p className="text-gray-600 mb-6">
              <strong>{document.title}</strong> başarıyla imzalandı.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/panel?token=${token}`)}
                className="w-full"
              >
                Belge Listesine Dön
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitSuccess(false);
                  loadRequest();
                }}
                className="w-full"
              >
                Tekrar İmzala
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Lojistik" className="h-8 sm:h-10 w-auto flex-shrink-0 object-contain" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/panel?token=${token}`)}
                className="flex-shrink-0 mt-0.5"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 line-clamp-1">
                  {document.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{document.description}</p>
              </div>
            </div>
            {isAlreadySigned && (
              <Badge className="bg-green-100 text-green-800 border-green-200 flex-shrink-0 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Önceden İmzalandı
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Belge önizleme (HTML veya PDF) */}
          <div className="order-1">
            <Card className="h-full">
              <CardHeader className="py-4 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="h-5 w-5" />
                  Belge Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                {document.contentHtml ? (
                  <div
                    className="h-[350px] sm:h-[450px] lg:h-[600px] overflow-auto rounded border bg-white p-4"
                    dangerouslySetInnerHTML={{
                      __html: getFilledHtml(
                        document.contentHtml,
                        request,
                        adSoyad,
                        tcKimlik,
                        signatureData,
                        docCode === KKD_TESLIM_TUTANAGI_CODE ? kkdRows : undefined,
                        docCode === KKD_TESLIM_TUTANAGI_CODE
                          ? (request?.signatures?.[docCode]?.signedAt
                              ? new Date(request.signatures[docCode].signedAt)
                              : request?.createdAt
                                ? new Date(request.createdAt)
                                : new Date()
                            ).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : undefined
                      ),
                    }}
                  />
                ) : (
                  <PDFViewer
                    document={document}
                    className="h-[350px] sm:h-[450px] lg:h-[600px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Signing Form */}
          <div className="order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İmza Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Consent Checkbox */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={consentChecked}
                      onCheckedChange={(checked) =>
                        setConsentChecked(checked as boolean)
                      }
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      Yukarıdaki belgeyi okudum, içeriğini anladım ve kabul
                      ediyorum.
                    </span>
                  </label>
                </div>

                <Separator />

                {/* Optional Form Fields - Ad Soyad ve TC (panelden gelebilir, burada opsiyonel düzenleme) */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Ek Bilgiler (Opsiyonel)
                  </h4>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="adSoyad">Ad Soyad</Label>
                      <Input
                        id="adSoyad"
                        placeholder="Ahmet Yılmaz"
                        value={adSoyad}
                        onChange={(e) => setAdSoyad(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tcKimlik">TCKN / VKN</Label>
                      <Input
                        id="tcKimlik"
                        placeholder="12345678901"
                        value={tcKimlik}
                        onChange={(e) => setTcKimlik(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* KKD Teslim Tutanağı: Teslim alınan malzemeler (checkbox) */}
                {docCode === KKD_TESLIM_TUTANAGI_CODE && (
                  <>
                    <Separator />
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Teslim Aldığınız KKD Malzemeleri (işaretleyin)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { n: 1, label: 'Kask (Kendimin)' },
                          { n: 2, label: 'Römork / Çanta / Kutu' },
                          { n: 3, label: 'Polar / Hırka' },
                          { n: 4, label: 'T-Shirt' },
                          { n: 5, label: 'Korumalı Mont' },
                          { n: 6, label: 'Yağmurluk' },
                          { n: 7, label: 'Korumalı Pantolon' },
                          { n: 8, label: 'Diğer (8)' },
                          { n: 9, label: 'Diğer (9)' },
                          { n: 10, label: 'Diğer (10)' },
                        ].map(({ n, label }) => (
                          <label key={n} className="flex items-center gap-2 cursor-pointer text-sm">
                            <Checkbox
                              checked={kkdRows.includes(n)}
                              onCheckedChange={(checked) => {
                                setKkdRows((prev) =>
                                  checked ? [...prev, n].sort((a, b) => a - b) : prev.filter((r) => r !== n)
                                );
                              }}
                            />
                            <span>{n}. {label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Signature Canvas */}
                <div>
                  <Label className="mb-2 block">
                    Dijital İmza <span className="text-red-500">*</span>
                  </Label>
                  <SignatureCanvas
                    onChange={handleSignatureChange}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || !consentChecked || !signatureData
                  }
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    'Kaydediliyor...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Onayla ve Kaydet
                    </>
                  )}
                </Button>

                {!consentChecked && (
                  <p className="text-xs text-amber-600 text-center">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Onay kutusunu işaretlemeniz gerekmektedir.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
