# Jurnal Guru Digital - Aplikasi Desktop Standalone (Windows & Linux Edition)

Aplikasi desktop resmi **Jurnal Guru Digital - Kurikulum Merdeka** untuk sistem operasi **Windows** dan **Linux** (Ubuntu, Debian, Linux Mint, Fedora, Arch, dll).
Didesain khusus untuk Bapak/Ibu Guru agar dapat mengelola jurnal pembelajaran, absensi, penilaian, agenda mengajar, dan administrasi guru secara cepat dan mandiri tanpa memerlukan koneksi internet dan tanpa server eksternal.

---

## ✨ Fitur Unggulan
1. **100% Offline & Mandiri**:
   - Berjalan mandiri tanpa memerlukan koneksi internet.
   - Menggunakan database lokal komputer yang aman dan privat.
2. **Login Langsung & Simpel**:
   - Langsung membuka halaman formulir login/dashboard.
   - Pendaftaran akun praktis (hanya Nama Guru dan Password).
3. **Pemulihan Kata Sandi Mandiri (Offline)**:
   - Fitur lupa kata sandi offline menggunakan PIN Keamanan pribadi 4-6 digit (terenkripsi BCrypt).
4. **Proteksi Ekstra Terintegrasi**:
   - DevTools Chromium & pintasan inspeksi (`F12`, `Ctrl+Shift+I`, `Ctrl+U`) dinonaktifkan.
   - Menu klik kanan / inspect element dikunci untuk menjaga keamanan antarmuka dan integritas data.

---

## 🪟 Panduan untuk Pengguna Windows
- **Menjalankan langsung (Development / Test)**:
  👉 Klik 2x file `BUKA_APLIKASI.bat`
- **Membangun Installer (.exe)**:
  👉 Klik 2x file `BUILD_INSTALLER.bat` atau jalankan `npm run dist:win`
  - Hasil paket instalasi di folder `dist/`:
    1. `Jurnal Guru Digital Setup 1.0.0.exe` (Installer Resmi)
    2. `Jurnal Guru Digital 1.0.0.exe` (Versi Portable)

---

## 🐧 Panduan untuk Pengguna Linux
- **Menjalankan langsung**:
  ```bash
  chmod +x buka-aplikasi.sh
  ./buka-aplikasi.sh
  ```
- **Membangun Paket Linux (AppImage & deb)**:
  ```bash
  chmod +x BUILD_LINUX.sh
  ./BUILD_LINUX.sh
  ```
- **Panduan lengkap Linux**: Baca file [PANDUAN_LINUX.md](PANDUAN_LINUX.md).

---

## ⌨️ Pintasan Keyboard (Shortcuts)
- **Ctrl + 1** : Dashboard Utama Jurnal Guru
- **F5** : Muat Ulang Halaman (*Reload*)
- **F11** : Layar Penuh (*Fullscreen*)
- **Alt + Left** : Halaman Sebelumnya (*Back*)
- **Alt + Right** : Halaman Berikutnya (*Forward*)
- **Alt + Home** : Kembali ke Beranda Aplikasi
- **Ctrl + Plus / Minus** : Memperbesar / Memperkecil Layar (*Zoom In / Out*)
- **Ctrl + 0** : Reset Ukuran Layar

---
© 2026 Anugrah Amanu Pratama - Jurnal Guru Digital
