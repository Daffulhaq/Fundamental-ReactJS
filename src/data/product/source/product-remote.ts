import type { ProductValues } from "../../../types/product"
import ApiError from "./api-error.ts"
import type { ProductFieldErrors } from "../model/product-input.ts"
import ProductListParam from "../param/product-list-param.ts"

export type ProductRemoteSource = {
    getProductListRemote: (param?: ProductListParam) => Promise<unknown>
    getProductRemote: (id: number) => Promise<unknown>
    createProductRemote: (values: ProductValues) => Promise<unknown>
    updateProductRemote: (id: number, values: ProductValues) => Promise<unknown>
    deleteProductRemote: (id: number) => Promise<void>
}

type ProductRemoteOptions = {
    baseUrl?: string
    fetchImpl?: typeof fetch
}

// Sends HTTP requests and returns the unvalidated JSON payload.
export default function ProductRemote({
    baseUrl = "",
    fetchImpl = fetch,
}: ProductRemoteOptions = {}): ProductRemoteSource {
    function buildUrl(path: string): URL {
        if (!baseUrl.trim()) {
            throw new Error("Isi VITE_API_BASE_URL di .env.local terlebih dahulu.")
        }

        const url = new URL(`${baseUrl.replace(/\/+$/, "")}${path}`)
        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("URL API harus menggunakan http atau https.")
        }
        return url
    }

    async function toApiError(response: Response, fallback: string) {
        const body: unknown = await response.json().catch(() => ({}))
        const record =
            typeof body === "object" && body !== null
                ? (body as Record<string, unknown>)
                : {}
        const fieldErrors: ProductFieldErrors = {}
        const backendErrors = record.errors

        if (typeof backendErrors === "object" && backendErrors !== null) {
            const entries = backendErrors as Record<string, unknown>
            if (typeof entries.name === "string") fieldErrors.name = entries.name
            if (typeof entries.price === "string") fieldErrors.price = entries.price
        }

        const backendMessage = record.message
        const message = Object.values(fieldErrors)[0]
            ?? (typeof backendMessage === "string"
                ? backendMessage
                : `${fallback} (HTTP ${response.status}).`)

        return new ApiError(message, response.status, fieldErrors)
    }

    async function request(
        url: URL,
        init: RequestInit,
        fallback: string,
    ): Promise<unknown> {
        let response: Response
        try {
            response = await fetchImpl(url, init)
        } catch {
            throw new Error("Tidak dapat terhubung ke server.")
        }

        if (!response.ok) throw await toApiError(response, fallback)
        if (response.status === 204) return null
        return response.json()
    }

    const jsonHeaders = { "Content-Type": "application/json", Accept: "application/json" }

    async function getProductListRemote(
        param = new ProductListParam(),
    ): Promise<unknown> {
        const url = buildUrl("/products")
        url.search = param.toQueryString()
        return request(
            url,
            { method: "GET", headers: { Accept: "application/json" } },
            "Gagal memuat produk",
        )
    }

    async function getProductRemote(id: number): Promise<unknown> {
        return request(
            buildUrl(`/products/${id}`),
            { method: "GET", headers: { Accept: "application/json" } },
            "Gagal memuat detail produk",
        )
    }

    async function createProductRemote(values: ProductValues): Promise<unknown> {
        return request(
            buildUrl("/products"),
            { method: "POST", headers: jsonHeaders, body: JSON.stringify(values) },
            "Gagal menyimpan produk.",
        )
    }

    async function updateProductRemote(
        id: number,
        values: ProductValues,
    ): Promise<unknown> {
        return request(
            buildUrl(`/products/${id}`),
            { method: "PUT", headers: jsonHeaders, body: JSON.stringify(values) },
            "Gagal memperbarui produk.",
        )
    }

    async function deleteProductRemote(id: number): Promise<void> {
        await request(
            buildUrl(`/products/${id}`),
            { method: "DELETE", headers: { Accept: "application/json" } },
            "Gagal menghapus produk.",
        )
    }

    return {
        getProductListRemote,
        getProductRemote,
        createProductRemote,
        updateProductRemote,
        deleteProductRemote,
    }
}
