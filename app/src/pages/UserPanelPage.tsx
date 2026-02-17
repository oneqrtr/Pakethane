import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Save,
} from 'lucide-react';
import { mockStore, STORAGE_KEY, debugStorage } from '@/lib/store/mockStore';
import { getDocumentsByCodes } from '@/config/documentPack';
import type { SigningRequest } from '@/types';
import { cn, formatDate, getClientIp } from '@/lib/utils';
import { SignatureCanvas } from '@/components/signature/SignatureCanvas';

export default function UserPanelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [request, setRequest] = useState<SigningRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [cepNumarasi, setCepNumarasi] = useState('');
  const [tcKimlik, setTcKimlik] = useState('');
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const [isSavingUserInfo, setIsSavingUserInfo] = useState(false);

  useEffect(() => {
    console.log('=== USER PANEL MOUNTED ===');
    console.log('URL Token:', token);
    console.log('STORAGE_KEY:', STORAGE_KEY);

    // Debug: Check localStorage directly
    const rawData = localStorage.getItem(STORAGE_KEY);
    console.log('Raw localStorage data:', rawData);

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        console.log('Available tokens:', Object.keys(parsed));
      } catch (e) {
        console.error('Failed to parse storage:', e);
      }
    }

    if (!token) {
      console.error('No token in URL');
      setError('Geçersiz erişim linki. Token bulunamadı.');
      setIsLoading(false);
      return;
    }

    loadRequest();
  }, [token]);

  const loadRequest = async () => {
    if (!token) return;

    console.log('Loading request for token:', token);
    setIsLoading(true);
    setError(null);

    try {
      const data = await mockStore.getRequest(token);
      console.log('Loaded request:', data);

      if (!data) {
        console.error('Request not found for token:', token);

        // Additional debug info
        const allRequests = await mockStore.listRequests();
        console.log('All available requests:', allRequests);

        setError(
          `İmza isteği bulunamadı.\n\n` +
          `Token: ${token}\n` +
          `Kayıtlı istek sayısı: ${allRequests.length}\n\n` +
          `Lütfen admin panelinden yeni bir link oluşturun veya sayfayı yenileyin.`
        );
      } else {
        setRequest(data);
        setAdSoyad(data.adSoyad || '');
        setEmail(data.email || '');
        setCepNumarasi(data.cepNumarasi || '');
        setTcKimlik(data.tcKimlik || '');
        setUserSignature(data.userSignaturePng || null);
      }
    } catch (err) {
      console.error('Error loading request:', err);
      setError('İstek yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }

    setIsLoading(false);
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    debugStorage();
    loadRequest();
  };

  const handleSaveUserInfo = async () => {
    if (!token) return;
    setIsSavingUserInfo(true);
    try {
      const ip = await getClientIp();
      const savedAt = new Date().toISOString();
      const updated = await mockStore.updateRequestUserInfo(token, {
        adSoyad: adSoyad || undefined,
        email: email || undefined,
        cepNumarasi: cepNumarasi || undefined,
        tcKimlik: tcKimlik || undefined,
        userSignaturePng: userSignature || undefined,
        savedAt,
        ipAddress: ip ?? undefined,
      });
      if (updated) setRequest(updated);
    } finally {
      setIsSavingUserInfo(false);
    }
  };

  const getProgress = (): number => {
    if (!request) return 0;
    const signedCount = Object.keys(request.signatures).length;
    const totalCount = request.selectedDocs.length;
    return totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;
  };

  const isDocumentSigned = (docCode: string): boolean => {
    return request?.signatures?.[docCode] !== undefined;
  };

  const getDocumentStatus = (docCode: string) => {
    const isSigned = isDocumentSigned(docCode);
    return {
      label: isSigned ? 'Tamamlandı' : 'Bekliyor',
      color: isSigned
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: isSigned ? CheckCircle : Clock,
    };
  };

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
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              İmza İsteği Bulunamadı
            </h1>
            <p className="text-gray-600 mb-4 whitespace-pre-line">{error}</p>
            <div className="space-y-2">
              <Button onClick={handleRefresh} variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Yeniden Dene
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Ana Sayfaya Dön
              </Button>
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-500">
              <p><strong>Debug Info:</strong></p>
              <p>Token: {token || 'YOK'}</p>
              <p>Storage Key: {STORAGE_KEY}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Beklenmeyen Hata</h1>
            <p className="text-gray-600 mb-4">İstek yüklenemedi.</p>
            <Button onClick={handleRefresh} variant="outline" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Yeniden Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documents = getDocumentsByCodes(request.selectedDocs);
  const progress = getProgress();
  const signedCount = Object.keys(request.signatures).length;
  const totalCount = request.selectedDocs.length;
  const isAllSigned = signedCount === totalCount;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Logo" className="h-24 sm:h-28 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            İmza Süreci
          </h1>
          <p className="text-gray-600">
            Aşağıdaki belgeleri okuyup dijital olarak imzalamanız gerekmektedir.
          </p>
        </div>

        {/* User Info Form - İmza süreci başında, ilerleme üstünde */}
        <Card>
          <CardHeader>
            <CardTitle>Bilgileriniz</CardTitle>
            <CardDescription>
              İmza sürecine başlamadan önce aşağıdaki bilgileri doldurun ve kaydedin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cepNumarasi">Cep Numarası</Label>
                <Input
                  id="cepNumarasi"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={cepNumarasi}
                  onChange={(e) => setCepNumarasi(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tcKimlik">TC Kimlik No</Label>
                <Input
                  id="tcKimlik"
                  placeholder="12345678901"
                  value={tcKimlik}
                  onChange={(e) => setTcKimlik(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dijital İmza</Label>
              <SignatureCanvas
                onChange={setUserSignature}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                İstek Tarihi: {formatDate(request.createdAt)}
              </p>
              <Button
                onClick={handleSaveUserInfo}
                disabled={isSavingUserInfo}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSavingUserInfo ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                İlerleme
              </span>
              <span className="text-sm font-medium text-gray-900">
                {signedCount} / {totalCount} Belge
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="mt-3 text-center">
              <Badge
                className={cn(
                  'border',
                  isAllSigned
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                )}
              >
                {isAllSigned ? 'Tüm Belgeler İmzalandı' : `%${progress} Tamamlandı`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {isAllSigned && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800 mb-2">
                Tüm Belgeler İmzalandı!
              </h2>
              <p className="text-green-700">
                Tüm belgeler başarıyla imzalandı ve admin&apos;e gönderildi.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              İmzalanacak Belgeler
            </CardTitle>
            <CardDescription>
              Her belgeyi okuyup dijital olarak imzalamanız gerekmektedir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc, index) => {
                const status = getDocumentStatus(doc.code);
                const StatusIcon = status.icon;

                return (
                  <div key={doc.code}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div
                        className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                          isDocumentSigned(doc.code)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {isDocumentSigned(doc.code) ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                        <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {doc.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {doc.description}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              'flex-shrink-0 border',
                              status.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>

                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              const path = doc.type === 'contract' || !doc.type
                                ? `/panel/sign/${doc.code}?token=${token}`
                                : `/panel/upload/${doc.code}?token=${token}`;
                              navigate(path);
                            }}
                            variant={
                              isDocumentSigned(doc.code)
                                ? 'outline'
                                : 'default'
                            }
                            className="w-full sm:w-auto"
                          >
                            {isDocumentSigned(doc.code) ? (
                              <>Tekrar Görüntüle ve {doc.type === 'contract' || !doc.type ? 'İmzala' : 'Yükle'}</>
                            ) : (
                              <>
                                {doc.type === 'contract' || !doc.type ? 'Aç ve İmzala' : 'Belge Yükle'}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Sorularınız için lütfen admin ile iletişime geçin.</p>
        </div>
      </div>
    </div>
  );
}
