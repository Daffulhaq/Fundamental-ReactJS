import { Link } from "react-router"
import { TbPackage } from "react-icons/tb"
import type { Product } from "../../../types/product"
import { formatRupiah } from "../../../utils/formatRupiah"
import Button from "../../atoms/Button"

type Props = {
    product: Product
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
}

// Molecule: one product with navigation and CRUD actions.
export default function ProductCard({ product, onEdit, onDelete }: Props) {
    return (
        <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    ID: {product.id}
                </span>
                <TbPackage className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
            </div>

            <h2 className="text-xl font-semibold wrap-break-word text-slate-900">
                <Link to={`/products/${product.id}`} className="hover:text-blue-700">
                    {product.name}
                </Link>
            </h2>
            <p className="mt-2 mb-6 text-2xl font-semibold wrap-break-word text-blue-600">
                {formatRupiah(product.price)}
            </p>

            <div className="mt-auto flex flex-wrap gap-2">
                <Link
                    to={`/products/${product.id}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                    Lihat detail
                </Link>
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => onEdit(product)}
                >
                    Ubah
                </Button>
                <Button
                    variant="subtleDanger"
                    className="flex-1"
                    onClick={() => onDelete(product)}
                >
                    Hapus
                </Button>
            </div>
        </article>
    )
}
