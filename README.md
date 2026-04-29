# 💊 PharmaVerify AI

Sistem cerdas berbasis *Multi-Way Matching* dan AI Document Intelligence untuk memverifikasi dokumen logistik, pesanan pembelian (PO), dan label fisik farmasi secara *real-time*.

![PharmaVerify Live](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)
![Backend](https://img.shields.io/badge/API-Railway-purple?style=for-the-badge)

## 🚀 Live Demo
Aplikasi dapat diakses secara publik melalui: **https://pharma-verify-ai.vercel.app/**

## 🧪 Panduan Pengujian Juri (Testing Scenarios)

Untuk mempermudah proses penjurian dan pengujian sistem, kami telah menyediakan dokumen uji coba di dalam repositori ini pada folder [`/DATASET`](./DATASET). 

Silakan unduh beberapa gambar dari folder tersebut dan jalankan skenario berikut pada Live Demo:

### 🟢 Skenario 1: Dokumen Valid (Match)
1. Buka halaman **Pemindai AI** pada aplikasi.
2. Pilih PO dari *dropdown* (misal: `PUR-001`).
3. Unggah salah satu gambar dari folder `DATASET/match`.
4. **Ekspektasi Hasil:** AI akan mengekstrak teks, mencocokkannya dengan database ERP, dan meloloskan dokumen (Status: **RECEIVED**). Indikator KPI di halaman *Dashboard* akan otomatis bertambah.

### 🔴 Skenario 2: Deteksi Anomali/Palsu (Mismatch)
1. Buka halaman **Pemindai AI**.
2. Pilih PO lainnya dari *dropdown*.
3. Unggah salah satu gambar dari folder `DATASET/mismatch` (gambar ini memiliki sedikit perbedaan teks atau ketidaksesuaian *batch number*).
4. **Ekspektasi Hasil:** AI akan mendeteksi perbedaan silang, memicu peringatan *plagiarism/anomaly*, dan menahan material (Status: **QUARANTINED**).

## 🛠️ Arsitektur Teknologi (Tech Stack)
Sistem ini dibangun dengan pemisahan *services* (*Decoupled Architecture*):
* **Frontend:** React + Vite + Tailwind CSS (Dihosting di Vercel)
* **Backend:** FastAPI + Python (Dihosting di Railway, *Zero Sleep*)
* **Database:** SQLite (Ditanamkan pada Backend dengan injeksi data simulasi otomatis)
* **AI Engine:** Microsoft Azure AI Document Intelligence

## 💻 Panduan Instalasi Lokal (Opsional)
Jika Anda ingin menjalankan sistem ini di komputer lokal (Windows/Linux Ubuntu):

```bash
# 1. Clone repositori
git clone [https://github.com/aknafff07/pharma-verify-ai.git](https://github.com/aknafff07/pharma-verify-ai.git)

# 2. Jalankan Backend (Buka terminal di folder /backend)
python -m venv venv
source venv/bin/activate  # Untuk Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Jalankan Frontend (Buka terminal baru di folder /frontend)
npm install
npm run dev
