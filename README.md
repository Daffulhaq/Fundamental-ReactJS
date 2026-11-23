# Manajemen Produk — Tugas 4

Aplikasi CRUD produk berbasis React yang memakai **React Router** untuk navigasi antarhalaman, **Tailwind CSS** untuk tampilan responsif, dan **backend Express + PostgreSQL** sebagai satu-satunya sumber data.

## Fitur

- CRUD produk (tambah, lihat, ubah, hapus) selalu melalui API backend.
- Pencarian produk berbasis query `q` ke backend.
- Halaman daftar `/products` dengan grid responsif (1 / 2 / 3 kolom).
- Halaman detail `/products/:id` yang mengambil data sesuai parameter URL, lengkap dengan tautan kembali dan pesan jelas bila produk tidak ada.
- Halaman 404 untuk URL yang tidak terdaftar, beserta tautan ke halaman utama dan daftar produk.
- Validasi form di frontend dan backend, dengan pesan error per field.
- Atomic Design: `atoms → molecules → organisms → templates → pages`.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, Vite 7, TypeScript, React Router 7, Tailwind CSS 4 |
| Backend | Node.js, Express 4, `pg`, `cors`, `dotenv` |
| Database | PostgreSQL |
| Pengujian | Node test runner (`tsx`), Playwright |

## Struktur Proyek

```text
.
├── app/                         # entry point + pemetaan route React Router
│   ├── entry.tsx                # BrowserRouter
│   ├── routes.tsx               # /, /products, /products/:id, *
│   ├── globals.css              # Tailwind + tema + utility
│   └── products/[id]/page.tsx   # wrapper halaman detail
├── src/
│   ├── components/
│   │   ├── atoms/               # Button
│   │   ├── molecules/           # Navbar, ProductCard, ProductForm, ConfirmDialog
│   │   ├── organisms/           # ProductGrid
│   │   ├── templates/           # PageLayout (Navbar + Outlet)
│   │   └── pages/               # ProductsPage, ProductDetailPage, NotFoundPage
│   ├── data/product/            # source → repository → model + service
│   ├── styles/                  # tema Tailwind dan base style
│   ├── types/                   # tipe Product / ProductValues
│   └── utils/                   # formatRupiah
├── backend/                     # Express API + skema PostgreSQL
├── tests/                       # unit test & Playwright browser test
└── assets/                      # bukti screenshot pengujian
```

> Folder `frontend/` adalah CRUD versi lama dari tugas sebelumnya dan tidak dipakai oleh build root.

## Rute Aplikasi

| URL | Halaman | Keterangan |
| --- | --- | --- |
| `/` | redirect | Dialihkan ke `/products` |
| `/products` | `ProductsPage` | Daftar, pencarian, dan CRUD |
| `/products/:id` | `ProductDetailPage` | Detail produk dari API; pesan "Produk tidak ditemukan" jika ID tidak ada |
| `*` | `NotFoundPage` | Halaman 404 dengan tautan pemulihan |

## Prasyarat

- Node.js ≥ 22.12 (sesuai `engines` di `package.json`)
- npm
- PostgreSQL

## Menyiapkan Backend

```bash
cd backend
npm install
cp .env.example .env
```

Di Windows:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Isi `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/tugas_produk
```

Buat database dan jalankan skema:

```bash
createdb tugas_produk
psql -d tugas_produk -f db/schema.sql
```

Jalankan server:

```bash
npm run dev
```

## Menyiapkan Frontend

Di terminal lain, dari root repository:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Di Windows:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Nilai `VITE_API_BASE_URL` harus menunjuk ke alamat backend. Nilai default-nya adalah `http://localhost:3000/api`, jadi `.env.local` opsional jika backend berjalan di port 3000.

Buka `http://localhost:5173`.

## Endpoint API

| Method | Endpoint | Fungsi | Status Sukses |
| --- | --- | --- | --- |
| GET | `/api/products` | Daftar produk (opsional `?q=nama`) | 200 |
| GET | `/api/products/:id` | Detail satu produk | 200 |
| POST | `/api/products` | Tambah produk | 201 |
| PUT | `/api/products/:id` | Ubah produk | 200 |
| DELETE | `/api/products/:id` | Hapus produk | 204 |

Body untuk POST dan PUT:

```json
{ "name": "Pulpen", "price": 5000 }
```

Validasi backend: `name` wajib dan maksimal 100 karakter; `price` berupa bilangan bulat `1..2_000_000_000`.

## Pengujian

```bash
npm test          # unit test data layer, model, dan validasi form
npm run test:e2e  # Playwright: CRUD, routing, detail, 404, responsivitas
npm run lint
npm run build
```

| No | Skenario | Hasil | Bukti |
| --- | --- | --- | --- |
| 1 | Daftar produk tampil responsif di 1440px | PASS | <a href="assets/tugas-4-01-daftar-desktop.png"><img src="assets/tugas-4-01-daftar-desktop.png" alt="Daftar produk desktop" width="180"></a> |
| 2 | Daftar produk tampil responsif di 390px (tanpa scroll horizontal) | PASS | <a href="assets/tugas-4-02-daftar-mobile.png"><img src="assets/tugas-4-02-daftar-mobile.png" alt="Daftar produk mobile" width="180"></a> |
| 3 | Tambah produk lewat form tersimpan ke API | PASS | <a href="assets/tugas-4-03-tambah-produk.png"><img src="assets/tugas-4-03-tambah-produk.png" alt="Tambah produk" width="180"></a> |
| 4 | Detail `/products/2` menampilkan data sesuai ID | PASS | <a href="assets/tugas-4-04-detail-produk.png"><img src="assets/tugas-4-04-detail-produk.png" alt="Detail produk" width="180"></a> |
| 5 | URL tidak terdaftar menampilkan halaman 404 | PASS | <a href="assets/tugas-4-05-halaman-404.png"><img src="assets/tugas-4-05-halaman-404.png" alt="Halaman 404" width="180"></a> |

Skenario lain yang diuji Playwright: validasi form kosong tanpa request, ubah data via PUT, hapus dengan konfirmasi, pencarian via query `q`, detail dengan ID tidak ada, dan pesan error saat backend gagal.

## Catatan

- Frontend dan backend harus berjalan bersamaan.
- Jika halaman detail di-refresh langsung pada hosting produksi, server harus mengembalikan `index.html` untuk URL SPA (fallback).
- Detail PR dan langkah reproduksi ada di [`PR_DESCRIPTION.md`](PR_DESCRIPTION.md).
