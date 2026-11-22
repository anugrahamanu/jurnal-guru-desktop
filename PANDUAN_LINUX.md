# Panduan Pemasangan & Penggunaan Jurnal Guru Digital di Linux (Ubuntu, Debian, Linux Mint, Fedora, Arch)

Aplikasi resmi **Jurnal Guru Digital - Kurikulum Merdeka** kini mendukung penuh sistem operasi **Linux**.

---

## 📦 Pilihan Cara Menjalankan di Linux

### Pilihan 1: Menggunakan AppImage (Paling Praktis - Tanpa Perlu Instal)
Format **AppImage** bisa langsung dibuka di hampir seluruh distro Linux:
1. Unduh file `Jurnal Guru Digital-1.0.0.AppImage` dari [GitHub Releases](https://github.com/anugrahamanu/jurnal-guru-desktop/releases).
2. Berikan izin eksekusi pada file tersebut:
   - **Lewat Antarmuka (GUI)**: Klik kanan file `.AppImage` -> *Properties* -> tab *Permissions* -> centang *"Allow executing file as program"*.
   - **Atau lewat Terminal**:
     ```bash
     chmod +x "Jurnal Guru Digital-1.0.0.AppImage"
     ./"Jurnal Guru Digital-1.0.0.AppImage"
     ```
3. Klik 2x file AppImage untuk langsung membuka aplikasi.

---

### Pilihan 2: Menggunakan Paket Debian/Ubuntu (`.deb`)
Untuk pengguna Ubuntu, Linux Mint, Debian, Zorin OS, dan turunannya:
1. Unduh file `jurnal-guru-desktop_1.0.0_amd64.deb`.
2. Pasang lewat terminal:
   ```bash
   sudo dpkg -i jurnal-guru-desktop_1.0.0_amd64.deb
   sudo apt-get install -f # Jika membutuhkan dependensi tambahan
   ```
3. Aplikasi akan otomatis muncul di menu aplikasi Linux (*Application Menu / Start Menu*).

---

### Pilihan 3: Menjalankan Langsung dari Source Code
Jika Anda ingin menjalankan atau mengembangkan langsung di Linux:
1. Buka Terminal di folder `desktop-app/`.
2. Jalankan skrip peluncur:
   ```bash
   chmod +x buka-aplikasi.sh
   ./buka-aplikasi.sh
   ```
   *(Skrip akan otomatis memeriksa dependensi Node.js dan membuka jendela aplikasi)*.

---

## ⚙️ Persyaratan Sistem Backend Lokal di Linux
Aplikasi desktop mandiri memanfaatkan PHP dan MariaDB/MySQL lokal:
- Pada distro Ubuntu/Debian/Mint, cukup pastikan PHP terpasang:
  ```bash
  sudo apt install -y php-cli php-mysql mariadb-server
  ```
- Jika MariaDB sudah aktif sebagai layanan Linux, aplikasi akan otomatis mendeteksi dan langsung terhubung secara lokal tanpa konfigurasi manual!

---
© 2026 Anugrah Amanu Pratama - Jurnal Guru Digital
