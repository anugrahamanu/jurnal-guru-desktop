#!/bin/bash
# =====================================================================
# Jurnal Guru Digital - Skrip Kompilasi Paket Installer Linux
# =====================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "   Membangun Paket Installer Linux (AppImage, deb, tar.gz) "
echo "=========================================================="

if [ ! -d "node_modules" ]; then
    echo "📦 Memasang dependensi..."
    npm install
fi

echo "🔨 Menjalankan build paket Linux..."
npm run dist:linux

echo "✅ Selesai! File installer tersedia di folder 'dist/'"
