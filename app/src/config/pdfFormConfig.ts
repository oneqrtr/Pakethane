/**
 * PDF form alanı eşleştirmesi: Kullanıcı verisi -> PDF form alan adı
 * Admin panelde "PDF Form Alanlarını Kontrol Et" ile gerçek alan isimlerini görüp
 * buraya yazın. Örnek: KVKK'da "Adı Soyadı/Unvanı" alanı "firma_adi" olabilir.
 */
export const PDF_FORM_FIELD_MAP: Record<string, string> = {
  adSoyad: 'firma_adi',
  email: 'email',
  tcKimlik: 'vergi_vkn',
  cepNumarasi: 'cep',
  adres: 'adres',
};

/**
 * İmza konumu: Kullanıcı/Firma imza alanının karşısı veya sayfa numarası (1/20) alanının soluna
 * A4 = 595x842 point. Origin sol alt (0,0).
 * Footer bölgesi: y=30-80. Sayfa no genelde orta/sağda (x~250-500). Soluna = x=60-120
 */
export const SIGNATURE_POSITION = {
  x: 80,      // Sayfa numarasının soluna (1/20 vb.)
  y: 50,      // Footer bölgesi
  width: 100,
  height: 40,
};
