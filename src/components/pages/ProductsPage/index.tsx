import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import type { Product, ProductValues } from "../../../types/product"
import { productRepository } from "../../../data/product/product-service"
import ProductListParam from "../../../data/product/param/product-list-param.ts"
import ApiError from "../../../data/product/source/api-error.ts"
import {
    validateProductValues,
    type ProductFieldErrors,
} from "../../../data/product/model/product-input.ts"
import Button from "../../atoms/Button"
import ConfirmDialog from "../../molecules/ConfirmDialog"
import ProductForm from "../../molecules/ProductForm"
import ProductGrid from "../../organisms/ProductGrid"

function toMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback
}

// Page: composes the API-backed CRUD flow from the smaller design-system pieces.
export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [notice, setNotice] = useState("")
    const [search, setSearch] = useState("")
    const [activeQuery, setActiveQuery] = useState("")
    const [formProduct, setFormProduct] = useState<Product | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formErrors, setFormErrors] = useState<ProductFieldErrors>({})
    const [isSaving, setIsSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchProducts = useCallback(async (query: string) => {
        try {
            const models = await productRepository.getProductList(
                new ProductListParam({ query }),
            )
            setProducts(models.map((model) => model.toJSON()))
        } catch (loadError) {
            setProducts([])
            setError(toMessage(loadError, "Gagal memuat produk."))
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadProducts = useCallback(
        async (query: string) => {
            setIsLoading(true)
            setError("")
            await fetchProducts(query)
        },
        [fetchProducts],
    )

    useEffect(() => {
        void fetchProducts("")
    }, [fetchProducts])

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const query = search.trim()
        setSearch(query)
        setActiveQuery(query)
        void loadProducts(query)
    }

    function openCreateForm() {
        setFormErrors({})
        setFormProduct(null)
        setIsFormOpen(true)
    }

    function openEditForm(product: Product) {
        setFormErrors({})
        setFormProduct(product)
        setIsFormOpen(true)
    }

    async function handleSave(values: ProductValues) {
        const clientErrors = validateProductValues(values)
        if (Object.keys(clientErrors).length > 0) {
            setFormErrors(clientErrors)
            return
        }

        setFormErrors({})
        setIsSaving(true)
        try {
            if (formProduct) {
                await productRepository.updateProduct(formProduct.id, values)
                setNotice(`Produk "${values.name}" berhasil diperbarui.`)
            } else {
                await productRepository.createProduct(values)
                setNotice(`Produk "${values.name}" berhasil ditambahkan.`)
            }
            setIsFormOpen(false)
            setFormProduct(null)
            await loadProducts(activeQuery)
        } catch (saveError) {
            if (saveError instanceof ApiError && Object.keys(saveError.fieldErrors).length) {
                setFormErrors(saveError.fieldErrors)
            } else {
                setError(toMessage(saveError, "Gagal menyimpan produk."))
            }
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await productRepository.deleteProduct(deleteTarget.id)
            setDeleteTarget(null)
            setNotice(`Produk "${deleteTarget.name}" berhasil dihapus.`)
            await loadProducts(activeQuery)
        } catch (deleteError) {
            setError(toMessage(deleteError, "Gagal menghapus produk."))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <header className="mb-8">
                <p className="mb-3 text-sm font-semibold text-blue-600">
                    Tugas 4 · React Router &amp; Tailwind CSS
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Daftar Produk
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Kelola produk melalui API. Tambah, lihat detail, ubah, dan
                    hapus data tanpa meninggalkan halaman.
                </p>
            </header>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex w-full gap-2 sm:max-w-md" role="search">
                    <label htmlFor="product-search" className="sr-only">
                        Cari produk
                    </label>
                    <input
                        id="product-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari nama produk…"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <Button type="submit" variant="secondary">
                        Cari
                    </Button>
                </form>
                <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => void loadProducts(activeQuery)} disabled={isLoading}>
                        Muat ulang
                    </Button>
                    <Button onClick={openCreateForm}>+ Tambah produk</Button>
                </div>
            </div>

            {error && (
                <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}
            <p role="status" aria-live="polite" className="mb-4 min-h-6 text-sm font-medium text-emerald-700">
                {notice}
            </p>

            <section aria-label="Daftar produk" aria-busy={isLoading}>
                {isLoading && (
                    <p className="mb-4 text-sm text-slate-500">Memuat produk dari API…</p>
                )}
                {!isLoading && products.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <p className="font-semibold text-slate-700">Belum ada produk.</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Tambah produk baru atau ubah kata kunci pencarianmu.
                        </p>
                    </div>
                )}
                <ProductGrid
                    products={products}
                    onEdit={openEditForm}
                    onDelete={setDeleteTarget}
                />
            </section>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                        <ProductForm
                            key={formProduct?.id ?? "new"}
                            title={formProduct ? "Ubah produk" : "Tambah produk"}
                            submitLabel={formProduct ? "Simpan perubahan" : "Tambah produk"}
                            initialValues={
                                formProduct
                                    ? { name: formProduct.name, price: formProduct.price }
                                    : undefined
                            }
                            errors={formErrors}
                            isSubmitting={isSaving}
                            onSubmit={(values) => void handleSave(values)}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title="Hapus produk?"
                    message={`Produk "${deleteTarget.name}" akan dihapus permanen dari backend.`}
                    isMutating={isDeleting}
                    onConfirm={() => void handleDelete()}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    )
}
