# Uygulama Portalı

Portal, ortak şifre ile korunur. `src/portal.html` içeriği şifreyle şifrelenip `index.html` olarak üretilir (PBKDF2-SHA256 + AES-256-GCM, tarayıcıda çözülür).

## Yayınlama

```bash
PORTAL_PASSWORD='ortak-şifre' node build.js
git add index.html && git commit -m "Rebuild encrypted portal" && git push
```

- Portal değiştiğinde `src/portal.html` düzenlenip yukarıdaki komut tekrar çalıştırılır.
- Şifre değişince herkesin oturumu geçersiz olur ve yeniden giriş istenir.
- Oturum 7 gün tarayıcıda (localStorage) saklanır.

Not: Şifre, depoda değil yalnızca üretim anında kullanılır. Şifreli dosya herkesçe indirilebilir; şifre en az 12 karakter ve tahmin edilmesi zor olmalıdır.
