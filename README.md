# Jurnal Guru Digital - Aplikasi Windows Desktop Standalone (100% Offline)

Aplikasi desktop resmi **Jurnal Guru Digital - Kurikulum Merdeka** untuk sistem operasi Windows.
Didesain khusus untuk Bapak/Ibu Guru agar dapat mengelola jurnal pembelajaran, absensi, penilaian, agenda mengajar, dan administrasi guru secara cepat dan mandiri tanpa memerlukan koneksi internet dan tanpa memerlukan server eksternal/XAMPP.

---

## ✨ Fitur Unggulan Versi Windows Desktop
1. **100% Offline & Mandiri (Zero Setup)**:
   - Dilengkapi embedded engine database lokal (MariaDB & PHP portable) otomatis.
   - Tidak memerlukan instalasi XAMPP, Apache, atau internet.
2. **Login Langsung & Simpel**:
   - Membuka aplikasi langsung ke formulir login tanpa halaman perantara (landing page).
   - Form pendaftaran akun simpel (cukup Nama Guru dan Password).
3. **Pemulihan Kata Sandi Mandiri (Offline)**:
   - Fitur lupa kata sandi offline menggunakan PIN Keamanan 4-6 digit terenkripsi BCrypt.
4. **Proteksi Ekstra Terintegrasi**:
   - DevTools Chromium & pintasan inspeksi (`F12`, `Ctrl+Shift+I`, `Ctrl+U`) dinonaktifkan.
   - Menu klik kanan / inspect element dikunci untuk mencegah pengubahan skrip tampilan.
   - Database lokal terisolasi di folder sistem privat `%APPDATA%\jurnal-guru-desktop\db_data`.

---

## 🚀 Cara Menjalankan Langsung (Mode Pengembangan / Test)
Cukup jalankan file:
👉 **`BUKA_APLIKASI.bat`**

Aplikasi akan otomatis menginstal dependensi (jika belum ada) lalu membuka jendela aplikasi desktop mandiri.

---

## 📦 Cara Membangun Installer `.exe`
Jalankan file:
👉 **`BUILD_INSTALLER.bat`**
atau jalankan:
```bash
npm run dist
```

Output paket instalasi akan tersimpan di dalam folder **`dist/`**:
1. **`Jurnal Guru Digital Setup 1.0.0.exe`** : Installer resmi untuk Windows (lengkap dengan desktop & start menu shortcut).
2. **`Jurnal Guru Digital 1.0.0.exe`** : Versi Portable (dapat langsung dibuka dari Flashdisk tanpa perlu instalasi).

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
