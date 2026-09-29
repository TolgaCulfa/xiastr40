# 🌐 XIAS Cloud DNS Platform (`xias.tr` & `xias.info`)

Modern, kurumsal ve tamamen ücretsiz alt alan adı (subdomain) ve DNS yönetim platformu. Arka planda **Cloudflare Anycast** küresel ağı ve **Vercel** barındırma omurgası çalışmaktadır.

---

## ✨ Özellikler

- 🚀 **İki Güçlü Kök Alan Adı:** `xias.tr` ve `xias.info`
- ⚡ **Canlı Müsaitlik Kontrolü:** Yazarken anında sorgulama, rezerve isim koruması ve format denetimi
- 🛡️ **Cloudflare Anycast Koruması:** Otomatik Katman 3/4 ve 7 DDoS engelleme
- 🔒 **Ücretsiz SSL/TLS:** Otomatik HTTPS sertifikasyonu
- 🎛️ **Gelişmiş DNS Kontrolü:** `A`, `AAAA`, `CNAME`, `TXT`, `MX` kayıtları ekleme, düzenleme ve silme
- ☁️ **Cloudflare Proxy Toggle:** Turuncu Bulut (CDN + DDoS) ve Gri Bulut (Yalnızca DNS) geçişi
- 🔀 **Doğrudan URL Yönlendirme (Page Rules):** 301 Kalıcı / 302 Geçici yönlendirmeler ile sunucusuz portföy, GitHub veya sosyal medya bağlantısı
- 🧭 **Entegrasyon Kılavuzları:** Vercel Custom Domain, GitHub Pages, VPS Nginx ve Cloudflare Tunnel için hazır kod şablonları
- 🎨 **Enterprise Tasarım Dili:** Neon ve abartılı cam efektleri içermeyen, Cloudflare ve Linear estetiğinde koyu slate arayüz

---

## 🛠️ Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## ⚙️ Cloudflare API Entegrasyonu (.env.local)

İsteğe bağlı olarak canlı Cloudflare DNS senkronizasyonu için ortam değişkenleri tanımlayabilirsiniz:

```env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID_XIASTR=your_xias_tr_zone_id
CLOUDFLARE_ZONE_ID_XIASINFO=your_xias_info_zone_id
```

Platform ayrıca web arayüzündeki **Cloudflare API Ayarları** menüsünden tarayıcı bazlı token test ve kayıt desteği sunmaktadır.

---

## 🚀 Vercel Dağıtımı

Proje Vercel üzerinde sıfır yapılandırma ile anında canlıya alınabilir. GitHub reponuza yapılan her push otomatik olarak Vercel tarafından derlenip yayınlanacaktır.
