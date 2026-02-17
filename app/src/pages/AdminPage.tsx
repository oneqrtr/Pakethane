import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  Trash2,
  Copy,
  CheckCircle,
  FileText,
  Send,
  AlertCircle,
  LogOut,
  Menu,
  X,
  Download,
} from 'lucide-react';
import { DOCUMENT_PACK, getDocumentByCode, SOURCE_PDF_PATH } from '@/config/documentPack';
import {
  mockStore,
  getUserPanelUrl,
  getStatusLabel,
  getStatusColor,
  debugStorage,
} from '@/lib/store/mockStore';
import type { DocumentDefinition, SigningRequest } from '@/types';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { isValidEmail, formatDate, cn } from '@/lib/utils';
import { generateFinalPdf } from '@/lib/generateFinalPdf';
import { fillAndSignSourcePdf } from '@/lib/fillAndSignSourcePdf';
import { inspectPdfFormFields } from '@/lib/inspectPdfFormFields';

const ADMIN_PASSWORD = 'Phane!';
const ADMIN_AUTH_KEY = 'admin_authenticated';

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [email, setEmail] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentDefinition | null>(null);
  const [viewRequest, setViewRequest] = useState<SigningRequest | null>(null);
  const [requests, setRequests] = useState<SigningRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'documents' | 'send' | 'signed'>('documents');
  const [signedFilter, setSignedFilter] = useState<'all' | 'pending' | 'partial' | 'completed'>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isFillingSourcePdf, setIsFillingSourcePdf] = useState(false);
  const [pdfInspectResult, setPdfInspectResult] = useState<{
    hasForm: boolean;
    fieldCount: number;
    fields: { name: string; type: string }[];
    error?: string;
  } | null>(null);
  const [isInspectingPdf, setIsInspectingPdf] = useState(false);

  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      loadRequests();
    }
  }, [isAdmin, isAuthenticated]);

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    const data = await mockStore.listRequests();
    setRequests(data);
    setIsLoadingRequests(false);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedDocs(DOCUMENT_PACK.map((doc) => doc.code));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleDocSelection = (code: string, checked: boolean) => {
    if (checked) {
      setSelectedDocs([...selectedDocs, code]);
    } else {
      setSelectedDocs(selectedDocs.filter((c) => c !== code));
    }
  };

  const handleSend = async () => {
    console.log('=== ADMIN: HANDLE SEND STARTED ===');

    if (!isValidEmail(email)) {
      alert('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (selectedDocs.length === 0) {
      alert('En az bir belge seçmelisiniz.');
      return;
    }

    setIsSending(true);

    try {
      console.log('Creating request with:', { email, adSoyad, selectedDocsCount: selectedDocs.length });

      const request = await mockStore.createRequest({
        email,
        adSoyad: adSoyad || undefined,
        selectedDocs,
      });

      console.log('Request created:', request);
      console.log('Token:', request.token);

      // Debug: Verify it was saved
      debugStorage();

      const link = window.location.origin + window.location.pathname + '#' + getUserPanelUrl(request.token);
      console.log('Generated link:', link);

      setGeneratedLink(link);
      setSendSuccess(true);

      setEmail('');
      setAdSoyad('');
      setSelectedDocs([]);
      setSelectAll(false);
      loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Gönderim sırasında bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRequest = async (token: string) => {
    if (confirm('Bu isteği silmek istediğinize emin misiniz?')) {
      await mockStore.deleteRequest(token);
      loadRequests();
    }
  };

  const getSignedCount = (request: SigningRequest): number => {
    return Object.keys(request.signatures).length;
  };

  const filteredRequests = requests.filter((r) => {
    if (signedFilter === 'all') return true;
    return r.status === signedFilter;
  });

  const handleInspectPdfForm = async () => {
    setIsInspectingPdf(true);
    setPdfInspectResult(null);
    try {
      const pdfUrl = window.location.origin + SOURCE_PDF_PATH;
      const result = await inspectPdfFormFields(pdfUrl);
      setPdfInspectResult(result);
    } catch (err) {
      setPdfInspectResult({ hasForm: false, fieldCount: 0, fields: [], error: String(err) });
    } finally {
      setIsInspectingPdf(false);
    }
  };

  const handleDownloadFinalPdf = async () => {
    if (!viewRequest) return;
    setIsGeneratingPdf(true);
    try {
      await generateFinalPdf(viewRequest);
    } catch (err) {
      console.error(err);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFillAndSignSourcePdf = async () => {
    if (!viewRequest) return;
    setIsFillingSourcePdf(true);
    try {
      await fillAndSignSourcePdf(viewRequest);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Kaynak PDF doldurulurken hata: ${msg}`);
    } finally {
      setIsFillingSourcePdf(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link kopyalandı!');
  };

  const scrollToSection = (sectionId: 'documents' | 'send' | 'signed') => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
    if (sectionId !== 'signed') {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setPasswordError('Hatalı şifre. Lütfen tekrar deneyin.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setSearchParams({});
  };

  const menuItems = [
    { id: 'documents' as const, label: 'Belge Paketi', icon: FileText },
    { id: 'send' as const, label: 'Kullanıcıya Gönder', icon: Send },
    { id: 'signed' as const, label: 'İmzalananlar', icon: CheckCircle },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Admin Erişimi
            </h1>
            <p className="text-gray-600 mb-4">
              Admin paneline erişmek için doğrulama gereklidir.
            </p>
            <Button onClick={() => setSearchParams({ admin: 'true' })}>
              Admin Olarak Devam Et
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdmin && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Admin Girişi</CardTitle>
            <CardDescription className="text-center">
              Devam etmek için şifrenizi girin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Şifre</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  autoFocus
                  autoComplete="current-password"
                  className={passwordError ? 'border-red-500' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - sticky on desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:transform-none lg:flex-shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Logo" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">E-İmza</h1>
                <p className="text-xs text-gray-500">Admin Paneli</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0">
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Logo" className="h-16 w-auto object-contain" />
          <h1 className="text-lg font-semibold">Admin Paneli</h1>
        </header>

        <div className="p-4 lg:p-8 space-y-12 max-w-6xl mx-auto">
          {activeSection === 'signed' ? (
            /* Section C: İmzalananlar */
            <section id="signed" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    İmzalananlar
                  </CardTitle>
                  <CardDescription>
                    Tüm imza isteklerini ve durumlarını görüntüleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Alt menü: Beklemede, Kısmi, Tamamlanan, Tümü */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { id: 'all' as const, label: 'Tümü' },
                      { id: 'pending' as const, label: 'Beklemede' },
                      { id: 'partial' as const, label: 'Kısmi' },
                      { id: 'completed' as const, label: 'Tamamlanan' },
                    ].map((f) => (
                      <Button
                        key={f.id}
                        variant={signedFilter === f.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSignedFilter(f.id)}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>

                  {isLoadingRequests ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Yükleniyor...</p>
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {requests.length === 0
                            ? 'Henüz imza isteği bulunmuyor.'
                            : 'Bu filtreye uygun istek bulunamadı.'}
                        </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İlerleme</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Aksiyonlar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => {
                            const signedCount = getSignedCount(request);
                            const totalCount = request.selectedDocs.length;
                            const progress =
                              totalCount > 0
                                ? Math.round((signedCount / totalCount) * 100)
                                : 0;

                            return (
                              <TableRow key={request.token}>
                                <TableCell>
                                  {request.adSoyad || (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>{request.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      'border',
                                      getStatusColor(request.status)
                                    )}
                                  >
                                    {getStatusLabel(request.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="w-32">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>
                                        {signedCount}/{totalCount}
                                      </span>
                                      <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatDate(request.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setViewRequest(request)}
                                      title="Görüntüle"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteRequest(request.token)
                                      }
                                      title="Sil"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : (
            <>
          {/* Section A: Belge Paketi */}
          <section id="documents" className="scroll-mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Belge Paketi
                </CardTitle>
                <CardDescription>
                  İmza için kullanılabilir belgeleri seçin ve önizleyin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">PDF Form Alanı Kontrolü</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Sözleşme PDF&apos;inde doldurulabilir form alanı var mı kontrol edin. Varsa kullanıcı bilgileriyle otomatik doldurma uygulanabilir.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInspectPdfForm}
                    disabled={isInspectingPdf}
                  >
                    {isInspectingPdf ? 'Kontrol ediliyor...' : 'PDF Form Alanlarını Kontrol Et'}
                  </Button>
                  {pdfInspectResult && (
                    <div className="mt-3 p-3 bg-white rounded border text-sm">
                      {pdfInspectResult.error ? (
                        <p className="text-red-600">{pdfInspectResult.error}</p>
                      ) : pdfInspectResult.hasForm ? (
                        <>
                          <p className="text-green-700 font-medium mb-2">
                            ✓ PDF&apos;de {pdfInspectResult.fieldCount} adet form alanı bulundu
                          </p>
                          <p className="text-xs text-gray-600 mb-1">Alan isimleri:</p>
                          <ul className="text-xs font-mono text-gray-700 max-h-32 overflow-y-auto space-y-1">
                            {pdfInspectResult.fields.map((f) => (
                              <li key={f.name}>
                                {f.name} <span className="text-gray-400">({f.type})</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-amber-700">
                          PDF&apos;de form alanı bulunamadı. Doldurulabilir alanlar yok.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">Tümünü Seç</span>
                  </label>
                </div>

                <div className="space-y-3">
                  {DOCUMENT_PACK.map((doc) => (
                    <div
                      key={doc.code}
                      className={cn(
                        'flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-lg border transition-colors',
                        selectedDocs.includes(doc.code)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedDocs.includes(doc.code)}
                          onCheckedChange={(checked) =>
                            handleDocSelection(doc.code, checked as boolean)
                          }
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                            {doc.type === 'contract' || !doc.type ? (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                Sayfa {doc.startPage}-{doc.endPage}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {doc.type === 'identity_card' ? 'Kimlik' :
                                  doc.type === 'driver_license' ? 'Ehliyet' :
                                    doc.type === 'tax_plate' ? 'Vergi Levhası' : 'Belge'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                        className="w-full sm:w-auto self-stretch sm:self-auto"
                      >
                        <Eye className="h-4 w-4 sm:mr-1" />
                        Önizle
                      </Button>
                    </div>
                  ))}
                </div>

                {selectedDocs.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedDocs.length}</strong> belge seçildi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Section B: Kullanıcıya Gönder */}
          <section id="send" className="scroll-mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Kullanıcıya Gönder
                </CardTitle>
                <CardDescription>
                  Seçili belgeleri imzalamak üzere kullanıcıya gönderin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-posta Adresi *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adSoyad">Ad Soyad (Opsiyonel)</Label>
                    <Input
                      id="adSoyad"
                      placeholder="Ahmet Yılmaz"
                      value={adSoyad}
                      onChange={(e) => setAdSoyad(e.target.value)}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Seçili Belgeler ({selectedDocs.length})
                    </h4>
                    {selectedDocs.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Henüz belge seçilmedi. Lütfen yukarıdan belge seçin.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {selectedDocs.map((code) => {
                          const doc = getDocumentByCode(code);
                          return (
                            <li
                              key={code}
                              className="text-sm text-gray-600 flex items-center gap-2"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {doc?.title}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={
                      isSending ||
                      !isValidEmail(email) ||
                      selectedDocs.length === 0
                    }
                    className="w-full"
                  >
                    {isSending ? 'Gönderiliyor...' : 'İmza İsteği Gönder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
            </>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] overflow-hidden p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
            <DialogDescription>{previewDoc?.description}</DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="h-[50vh] sm:h-[600px] min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
              {previewDoc.type === 'contract' || !previewDoc.type ? (
                <PDFViewer document={previewDoc} className="w-full h-full" />
              ) : (
                <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {previewDoc.title}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {previewDoc.type === 'tax_plate'
                      ? 'Bu belge için kullanıcıdan PDF dosyası yüklemesi istenecek.'
                      : 'Bu belge için kullanıcıdan ön ve arka yüz fotoğrafı yüklemesi istenecek.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Request Modal */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İmza İsteği Detayları</DialogTitle>
            <DialogDescription>
              Kullanıcının imzalama durumu ve detayları
            </DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4">
              {/* Kullanıcı bilgileri en üstte - Kaydet tıklandığında kaydedilen veriler */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <h4 className="font-semibold text-gray-900">Kullanıcı Bilgileri</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-gray-500">Ad Soyad</Label>
                    <p className="font-medium">{viewRequest.adSoyad || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">E-posta</Label>
                    <p className="font-medium">{viewRequest.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Cep</Label>
                    <p className="font-medium">{viewRequest.cepNumarasi || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">TC Kimlik</Label>
                    <p className="font-medium">{viewRequest.tcKimlik || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">İstek Tarihi</Label>
                    <p className="font-medium">{formatDate(viewRequest.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Bilgi Kayıt Tarihi</Label>
                    <p className="font-medium">{viewRequest.savedAt ? formatDate(viewRequest.savedAt) : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Cihaz IP Adresi</Label>
                    <p className="font-medium font-mono text-xs">{viewRequest.ipAddress || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Durum</Label>
                    <p>
                      <Badge className={cn('border', getStatusColor(viewRequest.status))}>
                        {getStatusLabel(viewRequest.status)}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-500 mb-2 block">İmzalanan Belgeler</Label>
                <div className="space-y-2">
                  {viewRequest.selectedDocs.map((docCode) => {
                    const doc = getDocumentByCode(docCode);
                    const signature = viewRequest.signatures[docCode];
                    return (
                      <div
                        key={docCode}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {signature ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">{doc?.title}</span>
                        </div>
                        {signature && (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-500 text-right">
                              {formatDate(signature.signedAt)}
                            </span>
                            {doc?.type === 'contract' && signature.signaturePng && (
                              <img
                                src={signature.signaturePng}
                                alt="İmza"
                                className="h-8 w-auto border rounded self-end"
                              />
                            )}
                            {(doc?.type === 'identity_card' || doc?.type === 'driver_license') && (
                              <div className="flex gap-2 justify-end">
                                {signature.frontImage && (
                                  <a
                                    href={signature.frontImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-16 h-10 border rounded overflow-hidden"
                                  >
                                    <img
                                      src={signature.frontImage}
                                      alt="Ön"
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                )}
                                {signature.backImage && (
                                  <a
                                    href={signature.backImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-16 h-10 border rounded overflow-hidden"
                                  >
                                    <img
                                      src={signature.backImage}
                                      alt="Arka"
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                )}
                              </div>
                            )}
                            {doc?.type === 'tax_plate' && signature.taxPlatePdf && (
                              <div className="flex justify-end">
                                <a
                                  href={signature.taxPlatePdf}
                                  download="vergi_levhasi.pdf"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  PDF İndir
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label className="text-gray-500 mb-2 block">PDF İndir</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleFillAndSignSourcePdf}
                      disabled={isFillingSourcePdf}
                      variant="default"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isFillingSourcePdf ? 'Hazırlanıyor...' : 'Kaynak PDF (Doldurulmuş + İmzalı)'}
                    </Button>
                    <Button
                      onClick={handleDownloadFinalPdf}
                      disabled={isGeneratingPdf}
                      variant="outline"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isGeneratingPdf ? 'Oluşturuluyor...' : 'Özet PDF'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Kaynak PDF:</strong> Sözleşme PDF&apos;i form alanları + imzalar (kullanıcı/firma alanı karşısı, sayfa no soluna). <strong>Özet PDF:</strong> Tüm bilgiler tek dosyada.
                  </p>
                </div>

                <div>
                <Label className="text-gray-500 mb-2 block">Kullanıcı Linki</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    readOnly
                    value={
                      window.location.origin +
                      window.location.pathname +
                      '#' +
                      getUserPanelUrl(viewRequest.token)
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        window.location.origin +
                          window.location.pathname +
                          '#' +
                          getUserPanelUrl(viewRequest.token)
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={sendSuccess} onOpenChange={setSendSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              İmza İsteği Gönderildi
            </DialogTitle>
            <DialogDescription>
              İmza isteği başarıyla oluşturuldu. Kullanıcıya aşağıdaki linki
              gönderebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input readOnly value={generatedLink} className="text-sm" />
              <Button variant="outline" size="icon" onClick={copyLink} className="flex-shrink-0 self-start sm:self-auto">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setSendSuccess(false)} className="w-full">
              Tamam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
