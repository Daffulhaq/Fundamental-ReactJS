# Manajemen Produk

Aplikasi CRUD produk sederhana berbasis React, Express, dan PostgreSQL. Pengguna dapat melihat daftar produk, mencari produk, menambah produk, mengubah data, dan menghapus produk melalui modal konfirmasi.

## Fitur

- Menampilkan daftar produk beserta harga dalam format Rupiah
- Pencarian produk berdasarkan nama
- Menambah produk baru melalui pop-up
- Mengubah data produk melalui pop-up
- Menghapus produk dengan konfirmasi
- Validasi input di frontend dan backend
- Pesan error yang jelas saat validasi gagal atau server tidak dapat dihubungi
- Data tersimpan permanen di PostgreSQL

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 18, Vite 5 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL |
| Lainnya | pg, dotenv, cors |

## Struktur Proyek

```text
Fundamental-ReactJS/
├── backend/
│   ├── db/
│   │   ├── pool.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── validateProduct.js
│   ├── routes/
│   │   └── products.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductFormModal.jsx
│   │   ├── hooks/
│   │   │   └── useProducts.js
│   │   ├── pages/
│   │   │   └── ProductPage.jsx
│   │   ├── utils/
│   │   │   └── formatPrice.js
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── assets/
│   └── screenshot pengujian
└── README.md
```

## Alur Aplikasi

1. Frontend meminta daftar produk melalui `GET /api/products` saat halaman dimuat.
2. Daftar produk disimpan pada state React dan ditampilkan sebagai card.
3. Form tambah dan edit mengirim data melalui `POST` atau `PUT`, lalu state lokal diperbarui tanpa reload halaman.
4. Tombol hapus membuka modal konfirmasi sebelum mengirim `DELETE /api/products/:id`.
5. Backend memvalidasi input, menjalankan query ke PostgreSQL, dan mengembalikan response JSON.
6. Jika request gagal, frontend menampilkan pesan error yang sesuai.

## Prasyarat

- Node.js 18 atau lebih baru
- PostgreSQL
- npm

## Menyiapkan Database

Buat database lalu jalankan skema:

```bash
createdb tugas_produk
psql -d tugas_produk -f backend/db/schema.sql
```

Skema akan membuat tabel `products` dan mengisi 5 data awal jika tabel masih kosong.

Jika database ingin dikosongkan dan diisi ulang:

```sql
TRUNCATE products RESTART IDENTITY;
```

lalu jalankan kembali `backend/db/schema.sql`.

## Konfigurasi Environment

Salin file contoh lalu sesuaikan koneksi database:

```bash
cp backend/.env.example backend/.env
```

Di Windows:

```powershell
Copy-Item backend/.env.example backend/.env
```

Isi `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/tugas_produk
```

Ganti `password` dengan password PostgreSQL milikmu. Jika password mengandung karakter khusus seperti `@`, tulis dalam bentuk URL-encoded, misalnya `@` menjadi `%40`.

## Menjalankan Aplikasi

Jalankan backend:

```bash
cd backend
npm install
npm run dev
```

Jalankan frontend di terminal lain:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

Frontend menggunakan proxy Vite sehingga request ke `/api` diteruskan ke `http://localhost:3000`.

## Endpoint API

| Method | Endpoint | Fungsi | Status Sukses |
|---|---|---|---|
| GET | `/api/products` | Mengambil semua produk | 200 |
| POST | `/api/products` | Menambah produk | 201 |
| PUT | `/api/products/:id` | Mengubah produk | 200 |
| DELETE | `/api/products/:id` | Menghapus produk | 204 |

Body untuk POST dan PUT:

```json
{
  "name": "Pulpen",
  "price": 5000
}
```

Aturan validasi:

- `name` wajib diisi, berupa teks, maksimal 100 karakter
- `price` wajib berupa bilangan bulat lebih dari 0 dan tidak lebih dari 2.000.000.000
- `id` pada URL harus berupa angka

## Pengujian

Pengujian dilakukan melalui browser dan Postman. Screenshot hasil pengujian tersimpan di folder [`assets/`](assets/). Setiap skenario di bawah ini memiliki bukti screenshot dan berstatus PASS.

| No | Skenario | Hasil | Screenshot |
|---|---|---|---|
| 1 | Halaman utama dimuat dan menampilkan 5 produk awal | PASS | <a href="assets/01-halaman-utama.png"><img src="assets/01-halaman-utama.png" alt="Halaman utama" width="220"></a> |
| 2 | Pencarian dengan kata kunci `Pulpen` | PASS | <a href="assets/02-pencarian-cocok.png"><img src="assets/02-pencarian-cocok.png" alt="Pencarian cocok" width="220"></a> |
| 3 | Pencarian dengan kata kunci yang tidak ada | PASS | <a href="assets/03-pencarian-tidak-ditemukan.png"><img src="assets/03-pencarian-tidak-ditemukan.png" alt="Pencarian tidak ditemukan" width="220"></a> |
| 4 | Pencarian tidak membedakan huruf besar dan kecil | PASS | <a href="assets/04-pencarian-case-insensitive.png"><img src="assets/04-pencarian-case-insensitive.png" alt="Pencarian case-insensitive" width="220"></a> |
| 5 | Pop-up tambah produk terbuka | PASS | <a href="assets/05-popup-tambah-produk.png"><img src="assets/05-popup-tambah-produk.png" alt="Pop-up tambah produk" width="220"></a> |
| 6 | Submit form kosong menampilkan pesan validasi | PASS | <a href="assets/06-validasi-form-kosong.png"><img src="assets/06-validasi-form-kosong.png" alt="Validasi form kosong" width="220"></a> |
| 7 | Tambah produk berhasil dan daftar bertambah menjadi 6 produk | PASS | <a href="assets/07-tambah-produk-berhasil.png"><img src="assets/07-tambah-produk-berhasil.png" alt="Tambah produk berhasil" width="220"></a> |
| 8 | Pop-up edit produk terbuka dengan data lama | PASS | <a href="assets/08-popup-edit-produk.png"><img src="assets/08-popup-edit-produk.png" alt="Pop-up edit produk" width="220"></a> |
| 9 | Perubahan data produk berhasil disimpan | PASS | <a href="assets/09-edit-produk-berhasil.png"><img src="assets/09-edit-produk-berhasil.png" alt="Edit produk berhasil" width="220"></a> |
| 10 | Tombol hapus menampilkan pop-up konfirmasi | PASS | <a href="assets/10-konfirmasi-hapus-produk.png"><img src="assets/10-konfirmasi-hapus-produk.png" alt="Konfirmasi hapus produk" width="220"></a> |
| 11 | `GET /api/products` mengembalikan daftar produk | PASS | <a href="assets/11-api-get-produk.png"><img src="assets/11-api-get-produk.png" alt="API GET produk" width="220"></a> |
| 12 | `POST /api/products` menambah produk baru | PASS | <a href="assets/12-api-tambah-produk.png"><img src="assets/12-api-tambah-produk.png" alt="API POST produk" width="220"></a> |
| 13 | Produk hasil POST melalui API tampil di frontend | PASS | <a href="assets/13-hasil-tambah-via-api.png"><img src="assets/13-hasil-tambah-via-api.png" alt="Hasil tambah via API" width="220"></a> |
| 14 | `PUT /api/products/:id` mengubah data produk | PASS | <a href="assets/14-api-edit-produk.png"><img src="assets/14-api-edit-produk.png" alt="API PUT produk" width="220"></a> |

*Klik gambar untuk melihat ukuran penuhnya.

## Catatan

- Backend dan frontend harus berjalan bersamaan.
- Jika muncul pesan "Terjadi kesalahan pada server.", periksa koneksi database dan pastikan database `tugas_produk` sudah dibuat serta skema sudah dijalankan.
- Jika muncul pesan "Tidak dapat terhubung ke server.", pastikan backend berjalan di port 3000.
