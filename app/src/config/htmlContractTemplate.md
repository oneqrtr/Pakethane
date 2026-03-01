# HTML Belge Şablonu – İçerik → HTML Çıktı

Siz bana belge **içeriğini** (metin) atacaksınız; ben size aşağıdaki kurallara uygun **HTML** çıktısı vereceğim. Bu HTML kullanıcıya gösterilir; kullanıcı "Okudum, anladım" onayını verip imza attığında imza, sayfada belirlenen yere otomatik yerleştirilir.

## Kural 1: İmza yerleştirme alanı

HTML içinde **tam olarak** aşağıdaki blok bulunmalı (imzanın konacağı yer):

```html
<div id="signature-placeholder" class="signature-box"></div>
```

- Bu blok genelde metnin **sonunda**, onay metninin hemen altında yer alır.
- Uygulama kullanıcı imza attığında bu `div` içine imza görselini yerleştirir.

## Kural 2: Metin değişkenleri (placeholder'lar)

Uygulama aşağıdaki ifadeleri ilgili değerlerle değiştirir (panel/istek verilerinden):

| Placeholder | Açıklama | Kaynak |
|-------------|----------|--------|
| `{{adSoyad}}` | Firma / Ad Soyad / Unvan | Panel formu veya istek |
| `{{vergiDairesiVkn}}` veya `{{tcKimlik}}` | Vergi Dairesi – VKN / TC Kimlik | Panel formu veya istek |
| `{{adres}}` | Adres | Panel formu veya istek |
| `{{email}}` | E-posta | İstek |
| `{{tarih}}` | İmza tarihi (gg.aa.yyyy) | İstek oluşturma tarihi veya bugün |
| `{{cepTelefonu}}` | Cep telefonu (EK-3 vb.) | Panel: Cep Numarası |
| `{{surucuBelgesiTarihi}}` | Sürücü belgesi veriliş tarihi (EK-3) | Panel: Sürücü Belgesi Veriliş Tarihi |
| `{{surucuSicilNo}}` | Sürücü sicil numarası (EK-3) | Panel: Sürücü Sicil Numarası |

Örnek: `Firma Adı: {{adSoyad}}` → "Firma Adı: Ahmet Yılmaz"

## Kural 3: Onay metni

"Okudum, anladım" metnini HTML içinde isterseniz kendi cümlenizle yazabilirsiniz; uygulamada ayrıca **checkbox** gösterileceği için kullanıcı zaten onayı oradan verecek. HTML’de sadece metin olarak şunu (veya benzeri) kullanmanız yeterli:

```html
<p class="onay-metni">Yukarıdaki metni okudum, anladım ve kabul ediyorum.</p>
<div id="signature-placeholder" class="signature-box"></div>
```

## Örnek tam şablon (sizin içeriğiniz buraya gelir)

Aşağıdaki `...BELGE İÇERİĞİ...` kısmına sizin göndereceğiniz metin yerleştirilir; ben size bu yapıda HTML dönerim.

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    .belge-html { font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #222; max-width: 210mm; margin: 0 auto; padding: 16px; }
    .belge-html h1 { font-size: 18px; margin-bottom: 12px; }
    .belge-html h2 { font-size: 16px; margin: 16px 0 8px 0; }
    .belge-html p { margin: 0 0 10px 0; }
    .onay-metni { margin-top: 24px; font-weight: 500; }
    .signature-box { min-height: 60px; margin-top: 12px; border: 1px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .signature-box img { max-width: 180px; max-height: 70px; object-fit: contain; }
  </style>
</head>
<body>
  <article class="belge-html">
    <h1>BELGE BAŞLIĞI</h1>
    <!-- Buraya sizin içeriğiniz gelir -->
    <p>...BELGE İÇERİĞİ...</p>

    <p class="onay-metni">Yukarıdaki metni okudum, anladım ve kabul ediyorum.</p>
    <div id="signature-placeholder" class="signature-box"></div>
  </article>
</body>
</html>
```

## Akış özeti

1. Siz bana metni atarsınız.
2. Ben yukarıdaki yapıda, `...BELGE İÇERİĞİ...` yerine içeriğinizi koyup **HTML** veririm.
3. Bu HTML uygulamada kullanıcıya gösterilir; sayfada "Okudum, anladım" checkbox’ı ve imza alanı da bulunur.
4. Kullanıcı onayı işaretleyip imza atınca, imza `id="signature-placeholder"` olan alana otomatik yerleştirilir.
5. İstenirse bu imzalı sayfa daha sonra PDF’e çevrilebilir (mevcut pdf-api ile).

Bu şekilde yapabiliriz; içerikleri attığınızda size doğrudan bu formatta HTML çıktı verebilirim.
