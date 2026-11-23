# [Tugas 4] React Router, Tailwind CSS, dan Integrasi Backend

Branch: `tugas-4` → `main`

## Ringkasan Perubahan

- Menambahkan React Router dengan nested layout: `/` (redirect), `/products`, `/products/:id`, dan wildcard `*` untuk halaman 404.
- Mengganti tampilan starter dengan utility Tailwind CSS yang responsif pada navbar, daftar produk (grid 1/2/3 kolom), form, modal konfirmasi, detail produk, dan halaman 404.
- Mengintegrasikan seluruh CRUD ke backend: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`.
- Menambahkan pencarian produk melalui query `q` dan validasi input di frontend serta backend.
- Menyusun UI dengan Atomic Design: `Button`, `Navbar`, `ProductCard`, `ProductForm`, `ConfirmDialog`, `ProductGrid`, `PageLayout`, dan tiga halaman.
- Memperbarui unit test, browser test Playwright, README, dan bukti screenshot.

## Bukti Pengujian

| Pengujian | Hasil | Bukti |
| --- | --- | --- |
| `npm test` | 14/14 PASS | Unit test source, repository, model, validasi form |
| `npm run test:e2e` | 11/11 PASS | CRUD, routing, detail, 404, error API, responsivitas 390px & 1440px |
| `npm run lint` | PASS | 0 error |
| `npm run build` | PASS | TypeScript + Vite production build |

Screenshot:

- [Daftar produk — desktop](assets/tugas-4-01-daftar-desktop.png)
- [Daftar produk — mobile](assets/tugas-4-02-daftar-mobile.png)
- [Form tambah produk](assets/tugas-4-03-tambah-produk.png)
- [Detail produk](assets/tugas-4-04-detail-produk.png)
- [Halaman 404](assets/tugas-4-05-halaman-404.png)

## Langkah Menjalankan

### Backend

```bash
cd backend
npm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
# isi DATABASE_URL sesuai PostgreSQL lokal
createdb tugas_produk
psql -d tugas_produk -f db/schema.sql
npm run dev                   # http://localhost:3000
```

### Frontend

```bash
# dari root repository
npm ci
cp .env.example .env.local    # Windows: Copy-Item .env.example .env.local
npm run dev                   # http://localhost:5173
```

`VITE_API_BASE_URL` di `.env.local` harus mengarah ke backend, misalnya `http://localhost:3000/api`.

## Checklist

- [x] CRUD berfungsi dan tersimpan melalui API
- [x] Detail produk sesuai `:id` dengan tautan kembali dan pesan not found
- [x] Halaman 404 dengan tautan pemulihan
- [x] Tampilan Tailwind yang rapi, konsisten, dan responsif
- [x] Atomic Design sesuai template
- [x] Branch `tugas-4` dan commit message bertema `feat(tugas-4)`
