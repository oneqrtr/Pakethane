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
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { SignatureCanvas } from '@/components/signature/SignatureCanvas';

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
  const [adres, setAdres] = useState('');

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
      if (existingSignature) {
        setConsentChecked(existingSignature.consentChecked);
        setSignatureData(existingSignature.signaturePng);
        if (existingSignature.formData) {
          setAdSoyad(existingSignature.formData.adSoyad || '');
          setTcKimlik(existingSignature.formData.tcKimlik || '');
          setAdres(existingSignature.formData.adres || '');
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
          adres: adres || undefined,
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/panel?token=${token}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {document.title}
                </h1>
                <p className="text-sm text-gray-500">{document.description}</p>
              </div>
            </div>
            {isAlreadySigned && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Önceden İmzalandı
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: PDF Viewer */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Belge Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PDFViewer
                  document={document}
                  className="h-[600px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Signing Form */}
          <div>
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

                {/* Optional Form Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Ek Bilgiler (Opsiyonel)
                  </h4>

                  <div className="grid gap-2">
                    <Label htmlFor="adSoyad">Ad Soyad</Label>
                    <Input
                      id="adSoyad"
                      placeholder="Ahmet Yılmaz"
                      value={adSoyad}
                      onChange={(e) => setAdSoyad(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tcKimlik">TCKN / VKN</Label>
                    <Input
                      id="tcKimlik"
                      placeholder="12345678901"
                      value={tcKimlik}
                      onChange={(e) => setTcKimlik(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adres">Adres</Label>
                    <textarea
                      id="adres"
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Adres bilgisi..."
                      value={adres}
                      onChange={(e) => setAdres(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Signature Canvas */}
                <div>
                  <Label className="mb-2 block">
                    Dijital İmza <span className="text-red-500">*</span>
                  </Label>
                  <SignatureCanvas
                    onChange={handleSignatureChange}
                    width={400}
                    height={150}
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
