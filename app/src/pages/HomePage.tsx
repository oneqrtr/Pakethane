import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSignature, Shield, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Logo" className="h-16 sm:h-20 w-auto flex-shrink-0 object-contain" />
            <span className="text-lg sm:text-xl font-bold truncate">E-İmza Sistemi</span>
          </div>
          <Link to="/admin?admin=true" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="text-sm">Admin Girişi</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-10 sm:mb-16">
          <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Pakethane Logo" className="h-32 sm:h-48 w-auto mx-auto mb-6 sm:mb-8 object-contain" />
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            Dijital Belge İmzalama Sistemi
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-1">
            Pakethane kurye sözleşmelerini hızlı, güvenli ve kolay bir şekilde
            dijital olarak imzalayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/admin?admin=true">
              <Button size="lg" className="gap-2">
                <Shield className="h-5 w-5" />
                Admin Paneli
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          <Card>
            <CardHeader>
              <FileSignature className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Kolay İmza</CardTitle>
              <CardDescription>
                Belgeleri dijital olarak okuyun ve kolayca imzalayın.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Güvenli Saklama</CardTitle>
              <CardDescription>
                İmzalarınız güvenli bir şekilde saklanır ve yönetilir.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Merkezi Yönetim</CardTitle>
              <CardDescription>
                Tüm imza süreçlerini tek bir panelden yönetin.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-10 sm:mb-16">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center">Nasıl Çalışır?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4">
              {[
                {
                  step: '1',
                  title: 'Belge Seçimi',
                  description: 'Admin panelinden imzalanacak belgeleri seçin.',
                },
                {
                  step: '2',
                  title: 'Davet Gönderin',
                  description: 'Kullanıcıya e-posta ile imza linki gönderin.',
                },
                {
                  step: '3',
                  title: 'İmzalama',
                  description: 'Kullanıcı belgeleri okuyup dijital imza atar.',
                },
                {
                  step: '4',
                  title: 'Tamamlandı',
                  description: 'Tüm imzalar merkezi olarak saklanır.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 px-4 sm:px-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">
                Hemen Başlayın
              </h3>
              <p className="mb-6 opacity-90">
                Admin paneline giriş yaparak belge imzalama sürecini başlatabilirsiniz.
              </p>
              <Link to="/admin?admin=true">
                <Button size="lg" variant="secondary" className="gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Admin Paneline Git
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm">
            © 2024 Pakethane E-İmza Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
