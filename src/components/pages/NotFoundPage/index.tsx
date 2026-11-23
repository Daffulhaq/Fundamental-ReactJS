import { Link } from "react-router"

// Page: wildcard route fallback with a clear message and recovery links.
export default function NotFoundPage() {
    return (
        <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-bold tracking-widest text-blue-600">ERROR 404</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Halaman tidak ditemukan
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                Alamat yang kamu buka tidak terdaftar pada aplikasi. Kembali ke
                halaman utama atau lihat daftar produk untuk melanjutkan.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                    to="/"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                    Ke halaman utama
                </Link>
                <Link
                    to="/products"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                    Kembali ke daftar produk
                </Link>
            </div>
        </section>
    )
}
