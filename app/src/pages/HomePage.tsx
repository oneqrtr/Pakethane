import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSignature, Shield, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">E-İmza Sistemi</span>
          </div>
          <Link to="/admin?admin=true">
            <Button variant="outline">Admin Girişi</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Dijital Belge İmzalama Sistemi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
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
        <div className="grid md:grid-cols-3 gap-6 mb-16">
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
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nasıl Çalışır?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
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
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">
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
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 Pakethane E-İmza Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
