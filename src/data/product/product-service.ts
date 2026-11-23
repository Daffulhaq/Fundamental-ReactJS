import ProductRepository from "./repository/product-repository.ts"
import ProductRemote from "./source/product-remote.ts"

// One configured instance shared by every page; the base URL comes from Vite env.
export const productRepository = ProductRepository(
    ProductRemote({
        baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    }),
)
