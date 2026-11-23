import { test } from "node:test"
import assert from "node:assert/strict"
import ProductModel from "../src/data/product/model/product-model.ts"
import ProductListParam from "../src/data/product/param/product-list-param.ts"
import ProductRemote, {
    type ProductRemoteSource,
} from "../src/data/product/source/product-remote.ts"
import ApiError from "../src/data/product/source/api-error.ts"
import ProductRepository from "../src/data/product/repository/product-repository.ts"

const sample = { id: 1, name: " Pulpen ", price: 5000 }
const values = { name: "Pensil", price: 4000 }

function createSource(overrides: Partial<ProductRemoteSource> = {}): ProductRemoteSource {
    return {
        getProductListRemote: async () => [],
        getProductRemote: async () => sample,
        createProductRemote: async () => sample,
        updateProductRemote: async () => sample,
        deleteProductRemote: async () => undefined,
        ...overrides,
    }
}

test("model memetakan response ke produk UI tanpa field tambahan", () => {
    const model = ProductModel.fromResponse({ ...sample, extra: "ignored" })
    assert.equal(model.getId(), 1)
    assert.equal(model.getName(), "Pulpen")
    assert.equal(model.getPrice(), 5000)
    assert.deepEqual(model.toJSON(), { id: 1, name: "Pulpen", price: 5000 })
})

test("model menolak data API yang melanggar kontrak produk", () => {
    for (const data of [
        null,
        {},
        { ...sample, id: 0 },
        { ...sample, name: " " },
        { ...sample, price: "5000" },
        { ...sample, price: -1 },
        { ...sample, price: 1.5 },
        { ...sample, price: Infinity },
    ]) {
        assert.throws(() => ProductModel.fromResponse(data), TypeError)
    }
})

test("parameter query di-encode dan query kosong dihilangkan", () => {
    assert.equal(new ProductListParam().toQueryString(), "")
    const query = new ProductListParam({
        query: " Buku & Pulpen ",
    }).toQueryString()
    assert.equal(new URLSearchParams(query).get("q"), "Buku & Pulpen")
})

test("pipeline source → repository → model memakai satu GET yang dikonfigurasi", async () => {
    let calls = 0
    const source = ProductRemote({
        baseUrl: "https://api.example.test/api/",
        fetchImpl: async (url, options) => {
            calls++
            assert.ok(url instanceof URL)
            assert.equal(
                url.href,
                "https://api.example.test/api/products?q=pul",
            )
            assert.equal(options?.method, "GET")
            assert.equal(
                new Headers(options?.headers).get("Accept"),
                "application/json",
            )
            return Response.json([sample])
        },
    })
    const repository = ProductRepository(source)
    const models = await repository.getProductList(
        new ProductListParam({ query: "pul" }),
    )
    assert.equal(calls, 1)
    assert.ok(models[0] instanceof ProductModel)
    assert.equal(models[0].getName(), "Pulpen")
})

test("tanpa URL API tidak ada request HTTP", async () => {
    let called = false
    const source = ProductRemote({
        fetchImpl: async () => {
            called = true
            return new Response()
        },
    })
    await assert.rejects(source.getProductListRemote(), /VITE_API_BASE_URL/)
    assert.equal(called, false)
})

test("source menolak HTTP error dan JSON yang tidak valid", async () => {
    const cases: [Response, RegExp | typeof SyntaxError][] = [
        [new Response("error", { status: 500 }), /HTTP 500/],
        [new Response("not-json"), SyntaxError],
    ]
    for (const [response, expected] of cases) {
        const source = ProductRemote({
            baseUrl: "https://api.example.test",
            fetchImpl: async () => response,
        })
        await assert.rejects(source.getProductListRemote(), expected)
    }
})

test("repository menerima array kosong dan menolak wrapper/ID duplikat", async () => {
    const empty = ProductRepository(createSource())
    assert.deepEqual(await empty.getProductList(), [])
    for (const response of [{ data: [sample] }, [sample, sample]]) {
        const repository = ProductRepository(
            createSource({ getProductListRemote: async () => response }),
        )
        await assert.rejects(repository.getProductList(), TypeError)
    }
})

test("repository mengambil detail berdasarkan ID dan mengubah 404 menjadi null", async () => {
    let requestedId: number | undefined
    const repository = ProductRepository(
        createSource({
            getProductRemote: async (id) => {
                requestedId = id
                return sample
            },
        }),
    )
    const model = await repository.getProduct(1)
    assert.equal(requestedId, 1)
    assert.equal(model?.getName(), "Pulpen")

    const missing = ProductRepository(
        createSource({
            getProductRemote: async () => {
                throw new ApiError("Produk tidak ditemukan.", 404)
            },
        }),
    )
    assert.equal(await missing.getProduct(999), null)
    await assert.rejects(repository.getProduct(0), /ID produk tidak valid/)
})

test("repository meneruskan values ke create dan update lalu menghapus berdasarkan ID", async () => {
    const calls: string[] = []
    const repository = ProductRepository(
        createSource({
            createProductRemote: async (payload) => {
                calls.push(`create:${payload.name}`)
                return { id: 2, ...payload }
            },
            updateProductRemote: async (id, payload) => {
                calls.push(`update:${id}:${payload.price}`)
                return { id, ...payload }
            },
            deleteProductRemote: async (id) => {
                calls.push(`delete:${id}`)
            },
        }),
    )
    const created = await repository.createProduct(values)
    const updated = await repository.updateProduct(2, values)
    await repository.deleteProduct(2)
    assert.deepEqual(calls, ["create:Pensil", "update:2:4000", "delete:2"])
    assert.equal(created.getName(), "Pensil")
    assert.equal(updated.getPrice(), 4000)
})

test("source mengirim method dan body yang sesuai untuk POST, PUT, dan DELETE", async () => {
    const seen: Array<{ method: string; path: string; body?: string }> = []
    const source = ProductRemote({
        baseUrl: "https://api.example.test/api",
        fetchImpl: async (url, options) => {
            const requestUrl = url as URL
            seen.push({
                method: options?.method ?? "",
                path: requestUrl.pathname,
                body: options?.body as string | undefined,
            })
            if (options?.method === "DELETE") return new Response(null, { status: 204 })
            return Response.json(sample)
        },
    })

    await source.createProductRemote(values)
    await source.updateProductRemote(5, values)
    await source.deleteProductRemote(5)
    assert.deepEqual(seen, [
        { method: "POST", path: "/api/products", body: JSON.stringify(values) },
        { method: "PUT", path: "/api/products/5", body: JSON.stringify(values) },
        { method: "DELETE", path: "/api/products/5", body: undefined },
    ])
})

test("source menerjemahkan error validasi backend menjadi field errors", async () => {
    const source = ProductRemote({
        baseUrl: "https://api.example.test/api",
        fetchImpl: async () =>
            Response.json({ errors: { name: "Nama produk wajib diisi." } }, { status: 400 }),
    })
    await assert.rejects(
        source.createProductRemote({ name: "", price: 1000 }),
        (error: unknown) => {
            assert.ok(error instanceof ApiError)
            assert.equal(error.status, 400)
            assert.equal(error.fieldErrors.name, "Nama produk wajib diisi.")
            assert.equal(error.message, "Nama produk wajib diisi.")
            return true
        },
    )
})
