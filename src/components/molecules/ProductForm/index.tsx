import { useState } from "react"
import type { FormEvent } from "react"
import type { ProductValues } from "../../../types/product"
import {
    parseProductValues,
    type ProductFieldErrors,
} from "../../../data/product/model/product-input.ts"
import Button from "../../atoms/Button"

type Props = {
    title: string
    submitLabel: string
    initialValues?: ProductValues
    errors?: ProductFieldErrors
    isSubmitting?: boolean
    onSubmit: (values: ProductValues) => void
    onCancel: () => void
}

const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"

// Molecule: reusable create/edit form with backend validation surfaced as field errors.
export default function ProductForm({
    title,
    submitLabel,
    initialValues,
    errors = {},
    isSubmitting = false,
    onSubmit,
    onCancel,
}: Props) {
    const [name, setName] = useState(initialValues?.name ?? "")
    const [price, setPrice] = useState(
        initialValues ? String(initialValues.price) : "",
    )

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        onSubmit(parseProductValues(name, price))
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Data akan langsung disimpan ke backend melalui API.
                </p>
            </div>

            <div>
                <label htmlFor="product-name" className="text-sm font-semibold text-slate-700">
                    Nama produk
                </label>
                <input
                    id="product-name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Buku Tulis"
                    autoComplete="off"
                    autoFocus
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "product-name-error" : undefined}
                    className={inputClass}
                />
                {errors.name && (
                    <p id="product-name-error" className="mt-2 text-sm text-red-600">
                        {errors.name}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="product-price" className="text-sm font-semibold text-slate-700">
                    Harga (Rp)
                </label>
                <input
                    id="product-price"
                    name="price"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Contoh: 12000"
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={errors.price ? "product-price-error" : undefined}
                    className={inputClass}
                />
                {errors.price && (
                    <p id="product-price-error" className="mt-2 text-sm text-red-600">
                        {errors.price}
                    </p>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Menyimpan…" : submitLabel}
                </Button>
            </div>
        </form>
    )
}
