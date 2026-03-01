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
  Truck,
  Package,
  Star,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Pencil,
  BookOpen,
  ScrollText,
} from 'lucide-react';
import { DOCUMENT_PACK, getDocumentByCode, SOURCE_PDF_PATH, KKD_TESLIM_TUTANAGI_CODE, FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI_CODE } from '@/config/documentPack';
import {
  mockStore,
  getUserPanelUrl,
  getStatusLabel,
  getStatusColor,
  debugStorage,
} from '@/lib/store/mockStore';
import { kuryeOlStore, hizmetAlStore } from '@/lib/store/applicationsStore';
import { referencesStore } from '@/lib/store/referencesStore';
import { blogStore } from '@/lib/store/blogStore';
import type { DocumentDefinition, SigningRequest, KuryeOlApplication, HizmetAlApplication, Reference, BlogPost } from '@/types';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { isValidEmail, formatDate, cn } from '@/lib/utils';
import { generateFinalPdf } from '@/lib/generateFinalPdf';
import { inspectPdfFormFields } from '@/lib/inspectPdfFormFields';
import { downloadSignedHtmlDocsAsPdf, hasSignedHtmlDocs } from '@/lib/htmlContractPdf';
import { injectVariablesIntoHtml } from '@/lib/htmlContractVariables';
import type { HtmlContractVariables } from '@/lib/htmlContractVariables';
import { adminLogStore } from '@/lib/store/adminLogStore';

const ADMIN_PASSWORD = 'Phane!';
const SUPERADMIN_PASSWORD = 'Mkays!';
const ADMIN_AUTH_KEY = 'admin_authenticated';
const SUPERADMIN_AUTH_KEY = 'superadmin_authenticated';

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SUPERADMIN_AUTH_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [email, setEmail] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [ek1Plaka, setEk1Plaka] = useState('');
  const [ek1MarkaModel, setEk1MarkaModel] = useState('');
  const [ek1ModelYili, setEk1ModelYili] = useState('');
  const [ek1SasiNo, setEk1SasiNo] = useState('');
  const [ek1MotorNo, setEk1MotorNo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentDefinition | null>(null);
  const [previewVariables, setPreviewVariables] = useState<HtmlContractVariables | null>(null);
  const [viewRequest, setViewRequest] = useState<SigningRequest | null>(null);
  const [requests, setRequests] = useState<SigningRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'kurye-ol' | 'hizmet-al' | 'documents' | 'send' | 'signed' | 'references' | 'blog' | 'log'>('kurye-ol');
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

  // Kurye ol / Hizmet al / Referanslar
  const [kuryeOlList, setKuryeOlList] = useState<KuryeOlApplication[]>([]);
  const [hizmetAlList, setHizmetAlList] = useState<HizmetAlApplication[]>([]);
  const [referencesList, setReferencesList] = useState<Reference[]>([]);
  const [kuryeOlFilter, setKuryeOlFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sendLinkApp, setSendLinkApp] = useState<KuryeOlApplication | null>(null);
  const [sendLinkEk1Plaka, setSendLinkEk1Plaka] = useState('');
  const [sendLinkEk1MarkaModel, setSendLinkEk1MarkaModel] = useState('');
  const [sendLinkEk1ModelYili, setSendLinkEk1ModelYili] = useState('');
  const [sendLinkEk1SasiNo, setSendLinkEk1SasiNo] = useState('');
  const [sendLinkEk1MotorNo, setSendLinkEk1MotorNo] = useState('');
  const [refForm, setRefForm] = useState<{ id?: string; title: string; logoUrl: string; link: string }>({ title: '', logoUrl: '', link: '' });
  const [refDialogOpen, setRefDialogOpen] = useState(false);
  const [blogList, setBlogList] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<{ id?: string; title: string; excerpt: string; content: string; imageUrl: string }>({ title: '', excerpt: '', content: '', imageUrl: '' });
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      loadRequests();
      setKuryeOlList(kuryeOlStore.getAll());
      setHizmetAlList(hizmetAlStore.getAll());
      setReferencesList(referencesStore.getAll());
      setBlogList(blogStore.getAll());
    }
  }, [isAdmin, isAuthenticated]);

  const refreshKuryeOl = () => setKuryeOlList(kuryeOlStore.getAll());
  const refreshReferences = () => setReferencesList(referencesStore.getAll());
  const refreshBlog = () => setBlogList(blogStore.getAll());

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
        ek1Plaka: ek1Plaka || undefined,
        ek1MarkaModel: ek1MarkaModel || undefined,
        ek1ModelYili: ek1ModelYili || undefined,
        ek1SasiNo: ek1SasiNo || undefined,
        ek1MotorNo: ek1MotorNo || undefined,
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
      setEk1Plaka('');
      setEk1MarkaModel('');
      setEk1ModelYili('');
      setEk1SasiNo('');
      setEk1MotorNo('');
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
      if (!hasSignedHtmlDocs(viewRequest)) {
        alert('Bu istekte imzalı HTML belge yok. Önce kullanıcının sözleşmeleri imzalaması gerekir.');
        return;
      }
      await downloadSignedHtmlDocsAsPdf(viewRequest);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`PDF oluşturulurken hata: ${msg}`);
    } finally {
      setIsFillingSourcePdf(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link kopyalandı!');
  };

  // Kurye ol: onayla / reddet
  const handleKuryeOlStatus = (app: KuryeOlApplication, status: 'approved' | 'rejected') => {
    kuryeOlStore.setStatus(app.id, status);
    refreshKuryeOl();
  };

  // Kurye ol: imza linki gönder (SigningRequest oluştur ve token'ı başvuruya yaz)
  const [sendLinkSelectedDocs, setSendLinkSelectedDocs] = useState<string[]>([]);
  const handleSendLinkFromKuryeOl = async () => {
    if (!sendLinkApp || sendLinkSelectedDocs.length === 0) return;
    try {
      const request = await mockStore.createRequest({
        email: sendLinkApp.email,
        adSoyad: sendLinkApp.adSoyad,
        selectedDocs: sendLinkSelectedDocs,
        ek1Plaka: sendLinkEk1Plaka || undefined,
        ek1MarkaModel: sendLinkEk1MarkaModel || undefined,
        ek1ModelYili: sendLinkEk1ModelYili || undefined,
        ek1SasiNo: sendLinkEk1SasiNo || undefined,
        ek1MotorNo: sendLinkEk1MotorNo || undefined,
      });
      kuryeOlStore.setStatus(sendLinkApp.id, 'approved', request.token);
      refreshKuryeOl();
      setGeneratedLink(window.location.origin + window.location.pathname + '#' + getUserPanelUrl(request.token));
      setSendSuccess(true);
      setSendLinkApp(null);
      setSendLinkSelectedDocs([]);
      setSendLinkEk1Plaka('');
      setSendLinkEk1MarkaModel('');
      setSendLinkEk1ModelYili('');
      setSendLinkEk1SasiNo('');
      setSendLinkEk1MotorNo('');
      loadRequests();
    } catch {
      alert('İmza isteği oluşturulurken hata oluştu.');
    }
  };

  // Referans ekle / güncelle / sil
  const handleRefSave = () => {
    if (!refForm.title.trim() || !refForm.logoUrl.trim()) return;
    if (refForm.id) {
      referencesStore.update(refForm.id, { title: refForm.title, logoUrl: refForm.logoUrl, link: refForm.link || undefined });
    } else {
      referencesStore.add({ title: refForm.title, logoUrl: refForm.logoUrl, link: refForm.link || undefined });
    }
    refreshReferences();
    setRefForm({ title: '', logoUrl: '', link: '' });
    setRefDialogOpen(false);
  };
  const handleRefDelete = (id: string) => {
    if (confirm('Bu referansı silmek istediğinize emin misiniz?')) {
      referencesStore.remove(id);
      refreshReferences();
    }
  };

  const handleBlogSave = () => {
    if (!blogForm.title.trim() || !blogForm.excerpt.trim() || !blogForm.imageUrl.trim()) return;
    if (blogForm.id) {
      blogStore.update(blogForm.id, { title: blogForm.title, excerpt: blogForm.excerpt, content: blogForm.content, imageUrl: blogForm.imageUrl });
    } else {
      blogStore.add({ title: blogForm.title, excerpt: blogForm.excerpt, content: blogForm.content, imageUrl: blogForm.imageUrl });
    }
    refreshBlog();
    setBlogForm({ title: '', excerpt: '', content: '', imageUrl: '' });
    setBlogDialogOpen(false);
  };
  const handleBlogDelete = (id: string) => {
    if (confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      blogStore.remove(id);
      refreshBlog();
    }
  };

  const scrollToSection = (sectionId: 'kurye-ol' | 'hizmet-al' | 'documents' | 'send' | 'signed' | 'references' | 'blog' | 'log') => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (password === SUPERADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      sessionStorage.setItem(SUPERADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setIsSuperAdmin(true);
      adminLogStore.add('superadmin', 'giriş');
      setPassword('');
    } else if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      sessionStorage.removeItem(SUPERADMIN_AUTH_KEY);
      setIsAuthenticated(true);
      setIsSuperAdmin(false);
      adminLogStore.add('admin', 'giriş');
      setPassword('');
    } else {
      setPasswordError('Hatalı şifre. Lütfen tekrar deneyin.');
    }
  };

  const handleLogout = () => {
    const wasSuperAdmin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SUPERADMIN_AUTH_KEY) === 'true';
    adminLogStore.add(wasSuperAdmin ? 'superadmin' : 'admin', 'çıkış');
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(SUPERADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setSearchParams({});
  };

  const menuItems = [
    { id: 'kurye-ol' as const, label: 'Kurye Ol Başvuruları', icon: Truck },
    { id: 'hizmet-al' as const, label: 'Hizmet Al Başvuruları', icon: Package },
    { id: 'documents' as const, label: 'Belge Paketi', icon: FileText },
    { id: 'send' as const, label: 'İmza Linki Gönder', icon: Send },
    { id: 'signed' as const, label: 'İmzalananlar', icon: CheckCircle },
    { id: 'references' as const, label: 'Referanslar', icon: Star },
    { id: 'blog' as const, label: 'Blog', icon: BookOpen },
    ...(isSuperAdmin ? [{ id: 'log' as const, label: 'Log', icon: ScrollText }] : []),
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
              <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Lojistik" className="h-20 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pakethane Lojistik</h1>
                <p className="text-xs text-gray-500">{isSuperAdmin ? 'Superadmin Paneli' : 'Admin Paneli'}</p>
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
          <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Lojistik" className="h-20 w-auto object-contain" />
          <h1 className="text-lg font-semibold">{isSuperAdmin ? 'Superadmin' : 'Admin'} Paneli</h1>
        </header>

        <div className="p-4 lg:p-8 space-y-12 max-w-6xl mx-auto">
          {activeSection === 'kurye-ol' ? (
            <section id="kurye-ol" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Kurye Ol Başvuruları
                  </CardTitle>
                  <CardDescription>
                    Pakethane kuryesi olmak isteyen adayların başvuruları. Onaylananlara imza linki gönderebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                      <Button
                        key={f}
                        variant={kuryeOlFilter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setKuryeOlFilter(f)}
                      >
                        {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylanan' : 'Reddedilen'}
                      </Button>
                    ))}
                  </div>
                  {kuryeOlList.filter((a) => kuryeOlFilter === 'all' || a.status === kuryeOlFilter).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Bu filtreye uygun başvuru yok.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Aksiyonlar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {kuryeOlList
                            .filter((a) => kuryeOlFilter === 'all' || a.status === kuryeOlFilter)
                            .map((app) => (
                              <TableRow key={app.id}>
                                <TableCell>{app.adSoyad}</TableCell>
                                <TableCell>{app.email}</TableCell>
                                <TableCell>{app.telefon}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      'border',
                                      app.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                                      app.status === 'approved' && 'bg-green-100 text-green-800',
                                      app.status === 'rejected' && 'bg-red-100 text-red-800'
                                    )}
                                  >
                                    {app.status === 'pending' ? 'Bekleyen' : app.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(app.createdAt)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2 flex-wrap">
                                    {app.status === 'pending' && (
                                      <>
                                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleKuryeOlStatus(app, 'approved')}>
                                          <ThumbsUp className="h-3 w-3" /> Onayla
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-1 text-red-600" onClick={() => handleKuryeOlStatus(app, 'rejected')}>
                                          <ThumbsDown className="h-3 w-3" /> Reddet
                                        </Button>
                                      </>
                                    )}
                                    {app.status === 'approved' && (
                                      <Button variant="default" size="sm" className="gap-1" onClick={() => { setSendLinkApp(app); setSendLinkSelectedDocs(DOCUMENT_PACK.filter((d) => d.type === 'contract' || !d.type).map((d) => d.code)); }}>
                                        <Send className="h-3 w-3" /> İmza linki gönder
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : activeSection === 'hizmet-al' ? (
            <section id="hizmet-al" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Kurye Hizmeti Al Başvuruları
                  </CardTitle>
                  <CardDescription>
                    Kurye hizmeti talep eden müşteri başvuruları.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hizmetAlList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Henüz başvuru yok.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Firma</TableHead>
                            <TableHead>Yetkili</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Talep</TableHead>
                            <TableHead>Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hizmetAlList.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell>{app.firmaAdi}</TableCell>
                              <TableCell>{app.yetkili}</TableCell>
                              <TableCell>{app.email}</TableCell>
                              <TableCell>{app.telefon}</TableCell>
                              <TableCell className="max-w-[200px] truncate" title={app.talep}>{app.talep}</TableCell>
                              <TableCell>{formatDate(app.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : activeSection === 'references' ? (
            <section id="references" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Referanslar
                  </CardTitle>
                  <CardDescription>
                    Landing sayfasındaki &quot;Referanslarımız&quot; kayan logoları buradan ekleyip çıkarabilirsiniz. Logo URL girin veya dosya yükleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="mb-4 gap-2" onClick={() => { setRefForm({ title: '', logoUrl: '', link: '' }); setRefDialogOpen(true); }}>
                    <Plus className="h-4 w-4" /> Referans Ekle
                  </Button>
                  {referencesList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Henüz referans eklenmedi.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Sıra</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referencesList.map((ref) => (
                            <TableRow key={ref.id}>
                              <TableCell>
                                <img src={ref.logoUrl} alt={ref.title} className="h-10 w-20 object-contain bg-gray-50 rounded" />
                              </TableCell>
                              <TableCell>{ref.title}</TableCell>
                              <TableCell className="max-w-[180px] truncate text-sm">{ref.link || '-'}</TableCell>
                              <TableCell>{ref.order}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => { setRefForm({ id: ref.id, title: ref.title, logoUrl: ref.logoUrl, link: ref.link || '' }); setRefDialogOpen(true); }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRefDelete(ref.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : activeSection === 'blog' ? (
            <section id="blog" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Blog
                  </CardTitle>
                  <CardDescription>
                    Landing sayfasındaki blog bölümünü buradan yönetin. Görsel URL girin veya dosya yükleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="mb-4 gap-2" onClick={() => { setBlogForm({ title: '', excerpt: '', content: '', imageUrl: '' }); setBlogDialogOpen(true); }}>
                    <Plus className="h-4 w-4" /> Blog Yazısı Ekle
                  </Button>
                  {blogList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Henüz blog yazısı yok.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Görsel</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Özet</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {blogList.map((post) => (
                            <TableRow key={post.id}>
                              <TableCell>
                                <img src={post.imageUrl} alt="" className="h-12 w-24 object-cover rounded bg-gray-50" />
                              </TableCell>
                              <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                              <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">{post.excerpt}</TableCell>
                              <TableCell className="text-sm">{formatDate(post.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => { setBlogForm({ id: post.id, title: post.title, excerpt: post.excerpt, content: post.content, imageUrl: post.imageUrl }); setBlogDialogOpen(true); }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleBlogDelete(post.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          ) : activeSection === 'signed' ? (
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
          ) : activeSection === 'log' ? (
            <section id="log" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5" />
                    Giriş / Çıkış Logu
                  </CardTitle>
                  <CardDescription>
                    Admin ve Superadmin giriş-çıkış kayıtları. Tarih ve saat bilgisiyle listelenir.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminLogStore.getAll().length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">Henüz log kaydı yok.</p>
                  ) : (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table className="min-w-[480px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tarih</TableHead>
                          <TableHead>Saat</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminLogStore.getAll().map((entry, idx) => {
                          const d = new Date(entry.at);
                          const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          return (
                            <TableRow key={idx}>
                              <TableCell>{dateStr}</TableCell>
                              <TableCell>{timeStr}</TableCell>
                              <TableCell>
                                <Badge variant={entry.role === 'superadmin' ? 'default' : 'secondary'}>
                                  {entry.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                                </Badge>
                              </TableCell>
                              <TableCell>{entry.action === 'giriş' ? 'Giriş' : 'Çıkış'}</TableCell>
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
                            PDF'de {pdfInspectResult.fieldCount} adet form alanı bulundu
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
                              doc.startPage != null && doc.endPage != null ? (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  Sayfa {doc.startPage}-{doc.endPage}
                                </Badge>
                              ) : null
                            ) : (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {doc.type === 'identity_card' ? 'Kimlik' :
                                  doc.type === 'driver_license' ? 'Sürücü Belgesi' :
                                    doc.type === 'tax_plate' ? 'Vergi Levhası' :
                                      doc.type === 'residence' ? 'İkametgah' :
                                        doc.type === 'criminal_record' ? 'Adli Sicil' : 'Belge'}
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
                        onClick={() => { setPreviewDoc(doc); setPreviewVariables(null); }}
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
                  Kurye adayına gönderilecek belgeleri seçip imza paneli linki oluşturun.
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

                  {selectedDocs.includes(FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI_CODE) && (
                    <div className="p-4 border rounded-lg space-y-3 bg-gray-50/50">
                      <p className="text-sm font-medium text-gray-700">
                        EK-1 B Tipi Taşıt Kiralama Sözleşmesi Ödeme Detayları — Motosiklet bilgileri (opsiyonel)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1">
                          <Label htmlFor="ek1Plaka">Plaka</Label>
                          <Input id="ek1Plaka" placeholder="34 ABC 123" value={ek1Plaka} onChange={(e) => setEk1Plaka(e.target.value)} />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="ek1MarkaModel">Marka / Model</Label>
                          <Input id="ek1MarkaModel" placeholder="Honda PCX" value={ek1MarkaModel} onChange={(e) => setEk1MarkaModel(e.target.value)} />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="ek1ModelYili">Model Yılı</Label>
                          <Input id="ek1ModelYili" placeholder="2024" value={ek1ModelYili} onChange={(e) => setEk1ModelYili(e.target.value)} />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="ek1SasiNo">Şasi No</Label>
                          <Input id="ek1SasiNo" placeholder="" value={ek1SasiNo} onChange={(e) => setEk1SasiNo(e.target.value)} />
                        </div>
                        <div className="grid gap-1 sm:col-span-2">
                          <Label htmlFor="ek1MotorNo">Motor No</Label>
                          <Input id="ek1MotorNo" placeholder="" value={ek1MotorNo} onChange={(e) => setEk1MotorNo(e.target.value)} />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const ek1Doc = getDocumentByCode(FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI_CODE);
                          if (ek1Doc) {
                            setPreviewDoc(ek1Doc);
                            setPreviewVariables({
                              plaka: ek1Plaka,
                              markaModel: ek1MarkaModel,
                              modelYili: ek1ModelYili,
                              sasiNo: ek1SasiNo,
                              motorNo: ek1MotorNo,
                            });
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        EK-1 önizle
                      </Button>
                    </div>
                  )}

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
                    {isSending ? 'Gönderiliyor...' : 'Panel Linki Oluştur'}
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
            <div className="h-[50vh] sm:h-[600px] min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              {previewDoc.contentHtml ? (
                <iframe
                  srcDoc={injectVariablesIntoHtml(previewDoc.contentHtml, previewVariables ?? {})}
                  title={previewDoc.title}
                  className="w-full h-full min-h-[300px] border-0 rounded-lg bg-white"
                  sandbox="allow-same-origin"
                />
              ) : previewDoc.type === 'contract' || !previewDoc.type ? (
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
                      ? 'Bu belge için kullanıcıdan PDF veya fotoğraf yüklemesi istenecek.'
                      : previewDoc.type === 'residence' || previewDoc.type === 'criminal_record'
                      ? 'Bu belge için kullanıcıdan fotoğraf veya PDF yüklemesi istenecek.'
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
                  <div className="sm:col-span-2">
                    <Label className="text-gray-500">Adres</Label>
                    <p className="font-medium">{viewRequest.adres || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Sürücü Belgesi Tarihi</Label>
                    <p className="font-medium">{viewRequest.surucuBelgesiTarihi || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Sürücü Sicil No</Label>
                    <p className="font-medium">{viewRequest.surucuSicilNo || '-'}</p>
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

              <Label className="text-gray-500 mb-2 block">İmzalanan Belgeler</Label>
              <div className="space-y-2">
                  {viewRequest.selectedDocs.map((docCode) => {
                    const doc = getDocumentByCode(docCode);
                    const signature = viewRequest.signatures[docCode];
                    return (
                      <div
                        key={docCode}
                        className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
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
                              {(doc?.type === 'residence' || doc?.type === 'criminal_record') && signature.uploadedDocument && (
                              <div className="flex flex-col gap-1 justify-end">
                                {signature.uploadedDocument.startsWith('data:image/') ? (
                                  <a
                                    href={signature.uploadedDocument}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-[120px] border rounded overflow-hidden"
                                  >
                                    <img
                                      src={signature.uploadedDocument}
                                      alt="Yüklenen belge"
                                      className="w-full h-auto object-contain"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={signature.uploadedDocument}
                                    download={doc?.type === 'residence' ? 'ikametgah.pdf' : 'adli_sicil.pdf'}
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-3 w-3" />
                                    PDF İndir
                                  </a>
                                )}
                              </div>
                              )}
                              {docCode === KKD_TESLIM_TUTANAGI_CODE && signature.formData?.kkdRows?.length ? (
                              <div className="text-xs text-amber-800 bg-amber-50 rounded px-2 py-1 mt-1">
                                <span className="font-medium">KKD teslim alınanlar:</span>{' '}
                                {[
                                  [1, 'Kask'],
                                  [2, 'Römork/Çanta/Kutu'],
                                  [3, 'Polar/Hırka'],
                                  [4, 'T-Shirt'],
                                  [5, 'Korumalı Mont'],
                                  [6, 'Yağmurluk'],
                                  [7, 'Korumalı Pantolon'],
                                  [8, 'Diğer 8'],
                                  [9, 'Diğer 9'],
                                  [10, 'Diğer 10'],
                                ]
                                  .filter(([n]) => signature.formData!.kkdRows!.includes(n as number))
                                  .map(([, label]) => label)
                                  .join(', ')}
                              </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                      {isFillingSourcePdf ? 'Hazırlanıyor...' : 'İmzalı Belgeleri PDF İndir'}
                    </Button>
                    <Button
                      onClick={handleDownloadFinalPdf}
                      disabled={isGeneratingPdf}
                      variant="outline"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isGeneratingPdf ? 'Oluşturuluyor...' : 'Özet PDF (Canlı İmza İçin)'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>İmzalı Belgeleri PDF:</strong> İmzalanmış tüm sözleşmeler dolu ve imzalı hâliyle tek PDF olarak indirilir (tarayıcıda oluşturulur, sunucu gerekmez). <strong>Özet PDF:</strong> Tek sayfa; canlı imza için kullanıcı bilgileri ve sözleşme isimleri + imzalar.
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

      {/* Kurye ol: İmza linki gönder dialog */}
      <Dialog open={!!sendLinkApp} onOpenChange={(open) => {
        if (!open) {
          setSendLinkApp(null);
          setSendLinkSelectedDocs([]);
          setSendLinkEk1Plaka('');
          setSendLinkEk1MarkaModel('');
          setSendLinkEk1ModelYili('');
          setSendLinkEk1SasiNo('');
          setSendLinkEk1MotorNo('');
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>İmza Linki Gönder</DialogTitle>
            <DialogDescription>
              {sendLinkApp && (
                <span>
                  {sendLinkApp.adSoyad} ({sendLinkApp.email}) için imza isteği oluşturup linki kopyalayın.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {sendLinkApp && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                İmzalanacak belgeleri seçin, ardından &quot;Link Oluştur&quot; ile panel linki oluşturulur.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {DOCUMENT_PACK.filter((d) => d.type === 'contract' || !d.type).map((doc) => (
                  <label key={doc.code} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={sendLinkSelectedDocs.includes(doc.code)}
                      onCheckedChange={(c) =>
                        setSendLinkSelectedDocs((prev) =>
                          c ? [...prev, doc.code] : prev.filter((x) => x !== doc.code)
                        )
                      }
                    />
                    <span className="text-sm">{doc.title}</span>
                  </label>
                ))}
              </div>
              {sendLinkSelectedDocs.includes(FRANCHISE_EK_B_TIPI_EK1_ODEME_DETAYLARI_CODE) && (
                <div className="p-3 border rounded-lg space-y-2 bg-gray-50/50">
                  <p className="text-sm font-medium text-gray-700">EK-1 Ödeme Detayları — Motosiklet bilgileri (opsiyonel)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Plaka" value={sendLinkEk1Plaka} onChange={(e) => setSendLinkEk1Plaka(e.target.value)} />
                    <Input placeholder="Marka / Model" value={sendLinkEk1MarkaModel} onChange={(e) => setSendLinkEk1MarkaModel(e.target.value)} />
                    <Input placeholder="Model Yılı" value={sendLinkEk1ModelYili} onChange={(e) => setSendLinkEk1ModelYili(e.target.value)} />
                    <Input placeholder="Şasi No" value={sendLinkEk1SasiNo} onChange={(e) => setSendLinkEk1SasiNo(e.target.value)} />
                    <Input placeholder="Motor No" className="col-span-2" value={sendLinkEk1MotorNo} onChange={(e) => setSendLinkEk1MotorNo(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSendLinkFromKuryeOl} disabled={sendLinkSelectedDocs.length === 0}>
                  Link Oluştur ve Kopyala
                </Button>
                <Button variant="outline" onClick={() => setSendLinkApp(null)}>İptal</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Referans ekle / düzenle dialog */}
      <Dialog open={refDialogOpen} onOpenChange={setRefDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{refForm.id ? 'Referans Düzenle' : 'Referans Ekle'}</DialogTitle>
            <DialogDescription>Landing sayfasındaki kayan logolar listesine eklenecek.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input
                value={refForm.title}
                onChange={(e) => setRefForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Firma / referans adı"
              />
            </div>
            <div className="space-y-2">
              <ImageUploadField
                label="Logo / Görsel (URL veya dosya yükleyin)"
                value={refForm.logoUrl}
                onChange={(url) => setRefForm((f) => ({ ...f, logoUrl: url }))}
                placeholder="https://... veya dosya seçin"
              />
            </div>
            <div className="space-y-2">
              <Label>Link (opsiyonel)</Label>
              <Input
                value={refForm.link}
                onChange={(e) => setRefForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefSave} disabled={!refForm.title.trim() || !refForm.logoUrl.trim()}>
                Kaydet
              </Button>
              <Button variant="outline" onClick={() => { setRefDialogOpen(false); setRefForm({ title: '', logoUrl: '', link: '' }); }}>
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blog Ekle / Düzenle dialog */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{blogForm.id ? 'Blog Yazısını Düzenle' : 'Blog Yazısı Ekle'}</DialogTitle>
            <DialogDescription>Landing blog bölümünde görünecek.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input
                value={blogForm.title}
                onChange={(e) => setBlogForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Yazı başlığı"
              />
            </div>
            <div className="space-y-2">
              <Label>Kısa özet</Label>
              <Input
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Listede görünecek kısa özet"
              />
            </div>
            <div className="space-y-2">
              <Label>İçerik</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={blogForm.content}
                onChange={(e) => setBlogForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Yazı içeriği (isteğe bağlı)"
              />
            </div>
            <ImageUploadField
              label="Kapak görseli (URL veya dosya yükleyin)"
              value={blogForm.imageUrl}
              onChange={(url) => setBlogForm((f) => ({ ...f, imageUrl: url }))}
              placeholder="https://... veya dosya seçin"
            />
            <div className="flex gap-2">
              <Button onClick={handleBlogSave} disabled={!blogForm.title.trim() || !blogForm.excerpt.trim() || !blogForm.imageUrl.trim()}>
                Kaydet
              </Button>
              <Button variant="outline" onClick={() => { setBlogDialogOpen(false); setBlogForm({ title: '', excerpt: '', content: '', imageUrl: '' }); }}>
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={sendSuccess} onOpenChange={setSendSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Panel Linki Oluşturuldu
            </DialogTitle>
            <DialogDescription>
              Kurye adayı için imza/panel linki hazır. Aşağıdaki linki kopyalayıp kullanıcıya gönderebilirsiniz.
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
