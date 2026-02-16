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
} from 'lucide-react';
import { DOCUMENT_PACK, getDocumentByCode } from '@/config/documentPack';
import {
  mockStore,
  getUserPanelUrl,
  getStatusLabel,
  getStatusColor,
  STORAGE_KEY,
  debugStorage,
} from '@/lib/store/mockStore';
import type { SigningRequest, DocumentDefinition } from '@/types';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { isValidEmail, formatDate, cn } from '@/lib/utils';

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [email, setEmail] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [requests, setRequests] = useState<SigningRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentDefinition | null>(null);
  const [viewRequest, setViewRequest] = useState<SigningRequest | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('documents');

  useEffect(() => {
    if (isAdmin) {
      loadRequests();
    }
  }, [isAdmin]);

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

      const link = window.location.origin + getUserPanelUrl(request.token);
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

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link kopyalandı!');
  };

  const getSignedCount = (request: SigningRequest): number => {
    return Object.keys(request.signatures).length;
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const menuItems = [
    { id: 'documents', label: 'Belge Paketi', icon: FileText },
    { id: 'send', label: 'Kullanıcıya Gönder', icon: Send },
    { id: 'signed', label: 'İmzalananlar', icon: CheckCircle },
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h1 className="text-xl font-bold text-gray-900">E-İmza</h1>
              <p className="text-xs text-gray-500">Admin Paneli</p>
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
              onClick={() => setSearchParams({})}
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
          <h1 className="text-lg font-semibold">Admin Paneli</h1>
        </header>

        <div className="p-4 lg:p-8 space-y-12 max-w-6xl mx-auto">
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
                        'flex items-start gap-3 p-4 rounded-lg border transition-colors',
                        selectedDocs.includes(doc.code)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <Checkbox
                        checked={selectedDocs.includes(doc.code)}
                        onCheckedChange={(checked) =>
                          handleDocSelection(doc.code, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          {doc.type === 'contract' || !doc.type ? (
                            <Badge variant="outline" className="text-xs">
                              Sayfa {doc.startPage}-{doc.endPage}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
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

          {/* Section C: İmzalananlar */}
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
                {isLoadingRequests ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Yükleniyor...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Henüz imza isteği bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
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
                        {requests.map((request) => {
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
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
            <DialogDescription>{previewDoc?.description}</DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İmza İsteği Detayları</DialogTitle>
            <DialogDescription>
              Kullanıcının imzalama durumu ve detayları
            </DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">E-posta</Label>
                  <p className="font-medium">{viewRequest.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Ad Soyad</Label>
                  <p className="font-medium">
                    {viewRequest.adSoyad || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Durum</Label>
                  <p>
                    <Badge
                      className={cn(
                        'border',
                        getStatusColor(viewRequest.status)
                      )}
                    >
                      {getStatusLabel(viewRequest.status)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Oluşturulma Tarihi</Label>
                  <p className="font-medium">
                    {formatDate(viewRequest.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500 mb-2 block">
                  İmzalanan Belgeler
                </Label>
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

                            {/* Contract Signature */}
                            {doc?.type === 'contract' && signature.signaturePng && (
                              <img
                                src={signature.signaturePng}
                                alt="İmza"
                                className="h-8 w-auto border rounded self-end"
                              />
                            )}

                            {/* Identity/Driver License Photos */}
                            {(doc?.type === 'identity_card' || doc?.type === 'driver_license') && (
                              <div className="flex gap-2 justify-end">
                                {signature.frontImage && (
                                  <a href={signature.frontImage} target="_blank" rel="noopener noreferrer" className="block w-16 h-10 border rounded overflow-hidden">
                                    <img src={signature.frontImage} alt="Ön" className="w-full h-full object-cover" />
                                  </a>
                                )}
                                {signature.backImage && (
                                  <a href={signature.backImage} target="_blank" rel="noopener noreferrer" className="block w-16 h-10 border rounded overflow-hidden">
                                    <img src={signature.backImage} alt="Arka" className="w-full h-full object-cover" />
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Tax Plate PDF */}
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

              <div className="pt-4 border-t">
                <Label className="text-gray-500 mb-2 block">
                  Kullanıcı Linki
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={
                      window.location.origin +
                      getUserPanelUrl(viewRequest.token)
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        window.location.origin +
                        getUserPanelUrl(viewRequest.token)
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Debug Section */}
      <section className="scroll-mt-8">
        <Card className="border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-gray-500">
              <p><strong>Storage Key:</strong> {STORAGE_KEY}</p>
              <p><strong>Kayıtlı İstek Sayısı:</strong> {requests.length}</p>
              <p><strong>Token Listesi:</strong></p>
              <ul className="pl-4 space-y-1">
                {requests.map((r) => (
                  <li key={r.token} className="font-mono">{r.token}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={debugStorage}
                className="mt-2"
              >
                Console'da Göster
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

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
            <div className="flex gap-2">
              <Input readOnly value={generatedLink} />
              <Button variant="outline" size="icon" onClick={copyLink}>
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
