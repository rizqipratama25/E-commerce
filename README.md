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

# Insatalasi dan Konfigurasi Docker
## 1. Install WSL
Silahkan tonton video tutorial instalasi WSL ini : https://youtu.be/zqw4EsSMMf4?si=4GoShx_ie1TOZjAl

## 2. Install Docker
Silahkan tonton video tutorial instalasi dan konfigurasi docker ini : https://youtu.be/t1qdBtJWJWU?si=dsLfVxbJwkMQ9shr

# Cara menjalankan Proyek
1. Buka docker desktop
2. Buka folder project di terminal
3. Jalankan perintah ini
```bash
mkdir typesense-data
```
4. Lalu jalankan perintah
```bash
docker-compose build
```
Ini akan membutuhkan waktu yang sedikit lama
5. Setelah itu jalankan perintah
``` bash
docker-compose up
```
6. Lalu buka port localhost:5173 di browser
7. Proyek sudah jalan
