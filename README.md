# E-commerce (UrbanMart)

# Instalasi dan konfigurasi ngrok
## 1. Install Ngrok
Download dan install Ngrok dari website resmi: https://ngrok.com/download
Pastikan setelah install kamu bisa menjalankan:
```bash
ngrok --version
```
Jika versi muncul, berarti instalasi berhasil

## 2. Login ke Dashboard Ngrok
Buka link berikut:
https://dashboard.ngrok.com/get-started/your-authtoken
Jika belum login, silakan login terlebih dahulu.

## 3. Salin Authtoken
Klik ikon mata (👁) untuk menampilkan authtoken
Salin token tersebut

## 4. Konfigurasi Authtoken di Terminal
Jalankan perintah berikut di terminal:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```
Ganti YOUR_AUTHTOKEN dengan token yang kamu salin dari dashboard.
Contoh:
```bash
ngrok config add-authtoken 2abc123xyz456example
```

## 5. Verifikasi
Jika berhasil, kamu akan melihat pesan bahwa authtoken telah ditambahkan.
Sekarang Ngrok sudah terinstall dan terkonfigurasi dengan benar

# Insatalasi Docker