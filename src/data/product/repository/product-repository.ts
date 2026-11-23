import type { ProductValues } from "../../../types/product"
import ApiError from "../source/api-error.ts"
import type { ProductRemoteSource } from "../source/product-remote.ts"
import ProductModel from "../model/product-model.ts"
import ProductListParam from "../param/product-list-param.ts"

// Maps remote payloads into validated application models.
export default function ProductRepository({
    getProductListRemote,
    getProductRemote,
    createProductRemote,
    updateProductRemote,
    deleteProductRemote,
}: ProductRemoteSource) {
    function assertId(id: number) {
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new Error("ID produk tidak valid.")
        }
    }

    async function getProductList(
        param = new ProductListParam(),
    ): Promise<ProductModel[]> {
        const response = await getProductListRemote(param)
        // The endpoint contract returns a direct array of products.
        if (!Array.isArray(response)) {
            throw new TypeError(
                "Contoh ini mengharapkan response API berupa array produk.",
            )
        }

        const products = response.map((item) => ProductModel.fromResponse(item))
        const ids = products.map((product) => product.getId())
        if (new Set(ids).size !== ids.length) {
            throw new TypeError("ID produk dari API harus unik.")
        }

        return products
    }

    async function getProduct(id: number): Promise<ProductModel | null> {
        assertId(id)
        try {
            const response = await getProductRemote(id)
            return ProductModel.fromResponse(response)
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) return null
            throw error
        }
    }

    async function createProduct(values: ProductValues): Promise<ProductModel> {
        return ProductModel.fromResponse(await createProductRemote(values))
    }

    async function updateProduct(
        id: number,
        values: ProductValues,
    ): Promise<ProductModel> {
        assertId(id)
        return ProductModel.fromResponse(await updateProductRemote(id, values))
    }

    async function deleteProduct(id: number): Promise<void> {
        assertId(id)
        await deleteProductRemote(id)
    }

    return {
        getProductList,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
    }
}
