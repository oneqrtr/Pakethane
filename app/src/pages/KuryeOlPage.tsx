import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { kuryeOlStore } from '@/lib/store/applicationsStore';
import { toast } from 'sonner';

export default function KuryeOlPage() {
  const navigate = useNavigate();
  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSoyad.trim() || !email.trim() || !telefon.trim()) {
      toast.error('Ad Soyad, E-posta ve Telefon alanları zorunludur.');
      return;
    }
    setSubmitting(true);
    try {
      kuryeOlStore.create({ adSoyad: adSoyad.trim(), email: email.trim(), telefon: telefon.trim(), mesaj: mesaj.trim() || undefined });
      toast.success('Başvurunuz alındı. En kısa sürede size dönüş yapacağız.');
      setAdSoyad('');
      setEmail('');
      setTelefon('');
      setMesaj('');
      navigate('/');
    } catch {
      toast.error('Başvuru gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <img
            src={`${import.meta.env.BASE_URL}logo.webp`}
            alt="Pakethane Lojistik"
            className="h-14 w-auto flex-shrink-0 object-contain"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900">Pakethane Kuryesi Ol</h1>
            <p className="text-sm text-gray-500">Kurye başvuru formu</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Başvuru Formu</CardTitle>
            <p className="text-sm text-muted-foreground">
              Formu doldurarak Pakethane Lojistik kurye ekibine katılmak için başvurabilirsiniz. Başvurunuz değerlendirildikten sonra size dönüş yapılacaktır.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adSoyad">Ad Soyad *</Label>
                <Input
                  id="adSoyad"
                  placeholder="Adınız Soyadınız"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mesaj">Mesaj (opsiyonel)</Label>
                <textarea
                  id="mesaj"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Eklemek istediğiniz notlar..."
                  value={mesaj}
                  onChange={(e) => setMesaj(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="gap-2">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </Button>
                <Link to="/">
                  <Button type="button" variant="outline">İptal</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
