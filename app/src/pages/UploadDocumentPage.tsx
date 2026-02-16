import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    FileText,
    Upload,
    X,
    Image as ImageIcon,
    Save
} from 'lucide-react';
import { mockStore } from '@/lib/store/mockStore';
import { getDocumentByCode } from '@/config/documentPack';
import type { SigningRequest } from '@/types';
import { cn } from '@/lib/utils';

export default function UploadDocumentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const params = useParams();
    const token = searchParams.get('token');
    const docCode = params.docCode as string;

    const [request, setRequest] = useState<SigningRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Upload states
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [taxPlatePdf, setTaxPlatePdf] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // File input refs
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    const document = getDocumentByCode(docCode);

    useEffect(() => {
        if (!token || !docCode) {
            setError('Geçersiz erişim linki.');
            setIsLoading(false);
            return;
        }

        if (!document) {
            setError('Belge bulunamadı.');
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
                setFrontImage(existingSignature.frontImage || null);
                setBackImage(existingSignature.backImage || null);
                setTaxPlatePdf(existingSignature.taxPlatePdf || null);
            }
        }
        setIsLoading(false);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (val: string | null) => void,
        type: 'image' | 'pdf'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (type === 'image' && !file.type.startsWith('image/')) {
            alert('Lütfen bir resim dosyası seçin.');
            return;
        }
        if (type === 'pdf' && file.type !== 'application/pdf') {
            alert('Lütfen PDF formatında bir dosya seçin.');
            return;
        }

        // Max size 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setter(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = (setter: (val: string | null) => void, inputRef: React.RefObject<HTMLInputElement | null>) => {
        setter(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!token || !docCode || !document) return;

        // Validation
        if (document.type === 'identity_card' || document.type === 'driver_license') {
            if (!frontImage || !backImage) {
                alert('Lütfen nufüs cüzdanı ve ehliyet için hem ön hem arka yüz fotoğrafını yükleyin.');
                return;
            }
        } else if (document.type === 'tax_plate') {
            if (!taxPlatePdf) {
                alert('Lütfen vergi levhası PDF dosyasını yükleyin.');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // Create signature object based on type
            const signatureData: any = {
                token,
                docCode,
                signedAt: new Date().toISOString(),
            };

            if (document.type === 'tax_plate') {
                signatureData.taxPlatePdf = taxPlatePdf;
            } else {
                signatureData.frontImage = frontImage;
                signatureData.backImage = backImage;
            }

            await mockStore.signDocument(signatureData); // Re-using signDocument as it just upserts into signatures map
            setSubmitSuccess(true);
        } catch (error) {
            console.error(error);
            alert('Dosyalar kaydedilirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAlreadySigned = request?.signatures?.[docCode] !== undefined;

    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} navigate={navigate} />;
    if (!document || !request) return null;
    if (submitSuccess) return <SuccessScreen document={document} token={token} navigate={navigate} setSubmitSuccess={setSubmitSuccess} loadRequest={loadRequest} />;

    const isIdentity = document.type === 'identity_card' || document.type === 'driver_license';
    const isTaxPlate = document.type === 'tax_plate';

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/panel?token=${token}`)}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{document.title}</h1>
                                <p className="text-sm text-gray-500">{document.description}</p>
                            </div>
                        </div>
                        {isAlreadySigned && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Yüklendi
                            </Badge>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Belge Yükleme</CardTitle>
                        <CardDescription>
                            {isIdentity
                                ? 'Lütfen belgenizin ön ve arka yüzünün fotoğrafını çekip yükleyiniz.'
                                : 'Lütfen vergi levhanızı PDF formatında yükleyiniz.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {isIdentity && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Front Side */}
                                <div className="space-y-3">
                                    <Label>Ön Yüz</Label>
                                    <div className={cn(
                                        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[200px] transition-colors relative bg-gray-50/50",
                                        frontImage ? "border-green-500 bg-green-50/10" : "border-gray-300 hover:bg-gray-50"
                                    )}>
                                        {frontImage ? (
                                            <div className="relative w-full h-full min-h-[160px]">
                                                <img src={frontImage} alt="Ön Yüz" className="w-full h-full object-contain max-h-[200px] rounded-md" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                                    onClick={() => handleRemoveFile(setFrontImage, frontInputRef)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Fotoğraf Yükle</p>
                                                    <p className="text-xs text-gray-500 mt-1">Veya kamerayı kullan</p>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => frontInputRef.current?.click()}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Seç
                                                </Button>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={frontInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => handleFileChange(e, setFrontImage, 'image')}
                                        />
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="space-y-3">
                                    <Label>Arka Yüz</Label>
                                    <div className={cn(
                                        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[200px] transition-colors relative bg-gray-50/50",
                                        backImage ? "border-green-500 bg-green-50/10" : "border-gray-300 hover:bg-gray-50"
                                    )}>
                                        {backImage ? (
                                            <div className="relative w-full h-full min-h-[160px]">
                                                <img src={backImage} alt="Arka Yüz" className="w-full h-full object-contain max-h-[200px] rounded-md" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                                    onClick={() => handleRemoveFile(setBackImage, backInputRef)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Fotoğraf Yükle</p>
                                                    <p className="text-xs text-gray-500 mt-1">Veya kamerayı kullan</p>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => backInputRef.current?.click()}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Seç
                                                </Button>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={backInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => handleFileChange(e, setBackImage, 'image')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isTaxPlate && (
                            <div className="space-y-3">
                                <Label>Vergi Levhası (PDF)</Label>
                                <div className={cn(
                                    "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors relative bg-gray-50/50",
                                    taxPlatePdf ? "border-green-500 bg-green-50/10" : "border-gray-300 hover:bg-gray-50"
                                )}>
                                    {taxPlatePdf ? (
                                        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border w-full max-w-sm">
                                            <div className="bg-red-100 p-2 rounded text-red-600">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 text-left overflow-hidden">
                                                <p className="text-sm font-medium truncate">Vergi_Levhasi.pdf</p>
                                                <p className="text-xs text-green-600 font-medium">Yüklendi</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveFile(setTaxPlatePdf, pdfInputRef)}
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium">PDF Dosyasını Yükleyin</p>
                                                <p className="text-sm text-gray-500 mt-1">Maksimum dosya boyutu: 5MB</p>
                                            </div>
                                            <Button onClick={() => pdfInputRef.current?.click()}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Dosya Seç
                                            </Button>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={pdfInputRef}
                                        className="hidden"
                                        accept="application/pdf"
                                        onChange={(e) => handleFileChange(e, setTaxPlatePdf, 'pdf')}
                                    />
                                </div>
                            </div>
                        )}

                        <Separator />

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting || (isIdentity && (!frontImage || !backImage)) || (isTaxPlate && !taxPlatePdf)}
                        >
                            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet ve Gönder'}
                            {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
                        </Button>

                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

// Sub-components for cleaner generic states
function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Yükleniyor...</p>
            </div>
        </div>
    );
}

function ErrorScreen({ error, navigate }: { error: string, navigate: any }) {
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

function SuccessScreen({ document, token, navigate, setSubmitSuccess, loadRequest }: any) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Belgeler Yüklendi!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        <strong>{document.title}</strong> başarıyla sisteme yüklendi.
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
                            Tekrar Düzenle
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
