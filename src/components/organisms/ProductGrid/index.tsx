import type { Product } from "../../../types/product"
import ProductCard from "../../molecules/ProductCard"

type Props = {
    products: Product[]
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
}

// Organism: responsive, mobile-first product list (1 / 2 / 3 columns).
export default function ProductGrid({ products, onEdit, onDelete }: Props) {
    return (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <li key={product.id} className="min-w-0">
                    <ProductCard
                        product={product}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </li>
            ))}
        </ul>
    )
}
