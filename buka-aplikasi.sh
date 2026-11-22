#!/bin/bash
# =====================================================================
# Jurnal Guru Digital - Skrip Peluncur Mandiri untuk Sistem Operasi Linux
# =====================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "   Jurnal Guru Digital - Standalone Edition (Linux)      "
echo "=========================================================="
echo ""

# 1. Periksa Node.js & NPM
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js belum terdeteksi di sistem Anda."
    echo "Silakan pasang Node.js dengan perintah:"
    echo "  sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

# 2. Periksa dependensi node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Memasang dependensi awal..."
    npm install
fi

# 3. Jalankan aplikasi desktop
echo "🚀 Memulai aplikasi Jurnal Guru Digital..."
npm start
