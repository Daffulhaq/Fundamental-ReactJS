import type { ProductValues } from "../../../types/product"

export type ProductFieldErrors = Partial<Record<keyof ProductValues, string>>

const MAX_NAME_LENGTH = 100
const MAX_PRICE = 2_000_000_000

// Frontend validation mirrors the backend contract so users get immediate feedback.
export function validateProductValues(values: ProductValues): ProductFieldErrors {
    const errors: ProductFieldErrors = {}
    const name = values.name.trim()

    if (!name) errors.name = "Nama produk wajib diisi."
    else if (name.length > MAX_NAME_LENGTH)
        errors.name = "Nama produk maksimal 100 karakter."

    if (!Number.isSafeInteger(values.price) || values.price <= 0)
        errors.price = "Harga harus berupa bilangan bulat lebih dari 0."
    else if (values.price > MAX_PRICE)
        errors.price = "Harga terlalu besar."

    return errors
}

export function parseProductValues(
    name: string,
    price: string,
): ProductValues {
    return { name: name.trim(), price: Number(price.trim()) }
}
