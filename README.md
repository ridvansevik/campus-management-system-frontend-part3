# Akıllı Kampüs Yönetim Sistemi - Frontend

Bu proje, Akıllı Kampüs API'sini tüketen modern bir web arayüzüdür. React, Vite ve Material UI kullanılarak geliştirilmiştir.

## 🚀 Teknolojiler

- **Framework:** React (Vite)
- **UI Kütüphanesi:** Material UI (MUI)
- **State Yönetimi:** Context API
- **Form Yönetimi:** Formik & Yup
- **HTTP İstekleri:** Axios (Interceptor yapısı ile)
- **Routing:** React Router DOM v7

## ✨ Özellikler

- 🔐 **Kimlik Doğrulama:** Giriş, Kayıt Ol, E-posta Doğrulama, Şifre Sıfırlama.
- 🛡️ **JWT Yönetimi:** Access Token süresi dolduğunda otomatik Refresh Token kullanımı.
- 👤 **Profil Yönetimi:** Kullanıcı bilgileri güncelleme, Profil fotoğrafı yükleme.
- 📊 **Dashboard:** Kullanıcı rolüne (Öğrenci/Akademisyen) özgü arayüz.
- 📱 **Responsive:** Mobil uyumlu tasarım.

## 🛠 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)

### Adım 1: Kurulum
Projeyi klonlayın ve bağımlılıkları yükleyin:
```bash
git clone https://github.com/ridvansevik/campus-management-system-frontend.git
cd frontend
npm install