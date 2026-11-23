import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { TbArrowLeft, TbPackage } from "react-icons/tb"
import type { Product, ProductValues } from "../../../types/product"
import { productRepository } from "../../../data/product/product-service"
import ApiError from "../../../data/product/source/api-error.ts"
import {
    validateProductValues,
    type ProductFieldErrors,
} from "../../../data/product/model/product-input.ts"
import { formatRupiah } from "../../../utils/formatRupiah"
import Button from "../../atoms/Button"
import ConfirmDialog from "../../molecules/ConfirmDialog"
import ProductForm from "../../molecules/ProductForm"

type Status = "loading" | "ready" | "not-found" | "error"

// Page: reads :id from the URL and loads that product directly from the API.
export default function ProductDetailPage() {
    const { id: idParam } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const id = Number(idParam)
    const isValidId = Number.isSafeInteger(id) && id > 0
    const [loaded, setLoaded] = useState<{ id: number; product: Product } | null>(null)
    const [missingId, setMissingId] = useState<number | null>(null)
    const [loadError, setLoadError] = useState("")
    const [notice, setNotice] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formErrors, setFormErrors] = useState<ProductFieldErrors>({})
    const [isSaving, setIsSaving] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const product = loaded?.id === id ? loaded.product : null
    const status: Status = !isValidId || missingId === id
        ? "not-found"
        : loadError
            ? "error"
            : product
                ? "ready"
                : "loading"

    const fetchProduct = useCallback(async () => {
        if (!isValidId) return
        try {
            const model = await productRepository.getProduct(id)
            setLoadError("")
            if (!model) {
                setMissingId(id)
                return
            }
            setMissingId(null)
            setLoaded({ id, product: model.toJSON() })
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? error.message
                    : "Gagal memuat detail produk.",
            )
        }
    }, [id, isValidId])

    useEffect(() => {
        void fetchProduct()
    }, [fetchProduct])

    async function handleSave(values: ProductValues) {
        const clientErrors = validateProductValues(values)
        if (Object.keys(clientErrors).length > 0) {
            setFormErrors(clientErrors)
            return
        }

        setFormErrors({})
        setIsSaving(true)
        try {
            const updated = await productRepository.updateProduct(id, values)
            setLoaded({ id, product: updated.toJSON() })
            setNotice(`Produk "${values.name}" berhasil diperbarui.`)
            setIsFormOpen(false)
        } catch (saveError) {
            if (saveError instanceof ApiError && Object.keys(saveError.fieldErrors).length) {
                setFormErrors(saveError.fieldErrors)
            } else {
                setLoadError(
                    saveError instanceof Error
                        ? saveError.message
                        : "Gagal memperbarui produk.",
                )
            }
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await productRepository.deleteProduct(id)
            navigate("/products")
        } catch (deleteError) {
            setLoadError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Gagal menghapus produk.",
            )
            setIsConfirmOpen(false)
        } finally {
            setIsDeleting(false)
        }
    }

    const backLink = (
        <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
            <TbArrowLeft aria-hidden="true" />
            Kembali ke daftar produk
        </Link>
    )

    return (
        <>
            <div className="mb-8">{backLink}</div>
            <p role="status" aria-live="polite" className="mb-4 min-h-6 text-sm font-medium text-emerald-700">
                {notice}
            </p>

            {status === "loading" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm text-slate-500">Memuat detail produk…</p>
                </div>
            )}

            {status === "not-found" && (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                    <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <TbPackage className="size-6" aria-hidden="true" />
                    </span>
                    <h1 className="text-2xl font-bold text-amber-900">
                        Produk tidak ditemukan
                    </h1>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-amber-800">
                        Tidak ada produk dengan ID &quot;{idParam}&quot; di backend.
                        Periksa kembali tautan atau kembali ke daftar produk.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <Button
                            onClick={() => navigate("/products")}
                            variant="secondary"
                        >
                            Lihat semua produk
                        </Button>
                    </div>
                </section>
            )}

            {status === "error" && (
                <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-800">
                        Detail produk gagal dimuat
                    </h1>
                    <p className="mt-2 text-sm text-red-700">{loadError}</p>
                    <div className="mt-6 flex justify-center">
                        <Button onClick={() => void fetchProduct()} variant="secondary">
                            Coba lagi
                        </Button>
                    </div>
                </section>
            )}

            {status === "ready" && product && (
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                ID: {product.id}
                            </span>
                            <h1 className="mt-4 text-3xl font-bold tracking-tight wrap-break-word text-slate-900 sm:text-4xl">
                                {product.name}
                            </h1>
                        </div>
                        <span className="flex size-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <TbPackage className="size-7" aria-hidden="true" />
                        </span>
                    </div>

                    <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Harga</dt>
                            <dd className="mt-1 text-3xl font-semibold wrap-break-word text-blue-600">
                                {formatRupiah(product.price)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Sumber data</dt>
                            <dd className="mt-1 text-base font-medium text-slate-700">
                                Backend API · GET /products/{product.id}
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button onClick={() => setIsFormOpen(true)}>+ Ubah produk</Button>
                        <Button variant="subtleDanger" onClick={() => setIsConfirmOpen(true)}>
                            Hapus produk
                        </Button>
                    </div>
                </article>
            )}

            {isFormOpen && product && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                        <ProductForm
                            key={product.id}
                            title="Ubah produk"
                            submitLabel="Simpan perubahan"
                            initialValues={{ name: product.name, price: product.price }}
                            errors={formErrors}
                            isSubmitting={isSaving}
                            onSubmit={(values) => void handleSave(values)}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isConfirmOpen && product && (
                <ConfirmDialog
                    title="Hapus produk?"
                    message={`Produk "${product.name}" akan dihapus permanen dari backend.`}
                    isMutating={isDeleting}
                    onConfirm={() => void handleDelete()}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
        </>
    )
}
