import { test, expect, type Page } from "@playwright/test"
import type { Product } from "../../src/types/product"

const API = "http://127.0.0.1:3001/api/products"
const initialProducts: Product[] = [
    { id: 1, name: "Pulpen", price: 5000 },
    { id: 2, name: "Buku Tulis", price: 12000 },
    { id: 3, name: "Spidol", price: 8000 },
]

async function mockProductApi(page: Page, products: Product[] = initialProducts) {
    const state = { items: [...products] }

    await page.route(`${API}**`, async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        const idMatch = url.pathname.match(/\/api\/products\/(\d+)$/)
        const id = idMatch ? Number(idMatch[1]) : null

        if (request.method() === "GET" && id === null) {
            const query = (url.searchParams.get("q") ?? "").toLowerCase()
            return route.fulfill({
                json: state.items.filter((item) =>
                    item.name.toLowerCase().includes(query),
                ),
            })
        }

        if (request.method() === "GET" && id !== null) {
            const item = state.items.find((product) => product.id === id)
            return item
                ? route.fulfill({ json: item })
                : route.fulfill({
                      status: 404,
                      json: { message: "Produk tidak ditemukan." },
                  })
        }

        if (request.method() === "POST") {
            const body = request.postDataJSON() as { name: string; price: number }
            const created = {
                id: Math.max(0, ...state.items.map((item) => item.id)) + 1,
                ...body,
            }
            state.items.push(created)
            return route.fulfill({ status: 201, json: created })
        }

        if (request.method() === "PUT" && id !== null) {
            const body = request.postDataJSON() as { name: string; price: number }
            const item = state.items.find((product) => product.id === id)
            if (!item) {
                return route.fulfill({
                    status: 404,
                    json: { message: "Produk tidak ditemukan." },
                })
            }
            Object.assign(item, body)
            return route.fulfill({ json: item })
        }

        if (request.method() === "DELETE" && id !== null) {
            const index = state.items.findIndex((product) => product.id === id)
            if (index === -1) {
                return route.fulfill({
                    status: 404,
                    json: { message: "Produk tidak ditemukan." },
                })
            }
            state.items.splice(index, 1)
            return route.fulfill({ status: 204 })
        }

        return route.fulfill({ status: 405, json: { message: "Method tidak didukung." } })
    })

    return state
}

test.beforeEach(async ({ page }) => {
    await mockProductApi(page)
})

for (const width of [390, 1440]) {
    test(`daftar produk dan navigasi tampil responsif pada ${width}px`, async ({
        page,
    }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto("/")
        await expect(page).toHaveURL(/\/products$/)
        await expect(
            page.getByRole("heading", { name: "Daftar Produk" }),
        ).toBeVisible()
        await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible()
        await expect(page.locator("article")).toHaveCount(3)
        await expect(
            page.getByRole("link", { name: "Lihat detail" }).first(),
        ).toBeVisible()

        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        ).toBe(true)
        await page.screenshot({
            path: `test-results/tugas-4-products-${width}.png`,
            fullPage: true,
        })
    })
}

test("tambah produk melalui form tersimpan ke API dan muncul di daftar", async ({
    page,
}) => {
    await page.goto("/products")
    await page.getByRole("button", { name: "+ Tambah produk" }).click()
    await page.getByLabel("Nama produk").fill("Penghapus")
    await page.getByLabel("Harga (Rp)").fill("3000")
    await page.getByRole("button", { name: "Tambah produk", exact: true }).click()

    await expect(page.getByRole("status")).toContainText("berhasil ditambahkan")
    await expect(page.getByRole("heading", { name: "Penghapus" })).toBeVisible()
    await expect(page.locator("article")).toHaveCount(4)
    await page.screenshot({
        path: "test-results/tugas-4-create.png",
        fullPage: true,
    })
})

test("validasi form kosong ditampilkan sebelum request dikirim", async ({ page }) => {
    let posts = 0
    await page.route(`${API}**`, async (route) => {
        if (route.request().method() === "POST") posts++
        await route.fallback()
    })
    await page.goto("/products")
    await page.getByRole("button", { name: "+ Tambah produk" }).click()
    await page.getByRole("button", { name: "Tambah produk", exact: true }).click()

    await expect(page.getByText("Nama produk wajib diisi.")).toBeVisible()
    await expect(page.getByText(/bilangan bulat/)).toBeVisible()
    expect(posts).toBe(0)
})

test("ubah produk memperbarui data dari API", async ({ page }) => {
    await page.goto("/products")
    const card = page.locator("article").filter({ hasText: "Pulpen" })
    await card.getByRole("button", { name: "Ubah" }).click()
    await page.getByLabel("Nama produk").fill("Pulpen Ultra")
    await page.getByLabel("Harga (Rp)").fill("6500")
    await page.getByRole("button", { name: "Simpan perubahan" }).click()

    await expect(page.getByRole("status")).toContainText("berhasil diperbarui")
    await expect(page.getByRole("heading", { name: "Pulpen Ultra" })).toBeVisible()
})

test("hapus produk memerlukan konfirmasi lalu daftar diperbarui", async ({ page }) => {
    await page.goto("/products")
    const card = page.locator("article").filter({ hasText: "Spidol" })
    await card.getByRole("button", { name: "Hapus" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toContainText("Hapus produk?")
    await dialog.getByRole("button", { name: "Hapus" }).click()

    await expect(page.getByRole("status")).toContainText("berhasil dihapus")
    await expect(page.locator("article")).toHaveCount(2)
    await expect(page.getByRole("heading", { name: "Spidol" })).toHaveCount(0)
})

test("pencarian nama produk menggunakan query ke backend", async ({ page }) => {
    await page.goto("/products")
    await page.getByRole("searchbox", { name: "Cari produk" }).fill("buku")
    await page.getByRole("button", { name: "Cari" }).click()

    await expect(page.locator("article")).toHaveCount(1)
    await expect(page.getByRole("heading", { name: "Buku Tulis" })).toBeVisible()
})

test("halaman detail menampilkan produk sesuai parameter id dan kembali ke daftar", async ({
    page,
}) => {
    await page.goto("/products")
    await page
        .locator("article")
        .filter({ hasText: "Buku Tulis" })
        .getByRole("link", { name: "Lihat detail" })
        .click()

    await expect(page).toHaveURL(/\/products\/2$/)
    await expect(page.getByRole("heading", { name: "Buku Tulis" })).toBeVisible()
    await expect(page.getByText(/Rp\s*12\.000/)).toBeVisible()
    await page.screenshot({
        path: "test-results/tugas-4-detail.png",
        fullPage: true,
    })

    await page.getByRole("link", { name: "Kembali ke daftar produk" }).click()
    await expect(page).toHaveURL(/\/products$/)
})

test("detail produk dengan id yang tidak ada menampilkan pesan jelas", async ({
    page,
}) => {
    await page.goto("/products/999")
    await expect(
        page.getByRole("heading", { name: "Produk tidak ditemukan" }),
    ).toBeVisible()
    await expect(page.getByText(/ID "999"/)).toBeVisible()
    await expect(
        page.getByRole("link", { name: "Kembali ke daftar produk" }),
    ).toBeVisible()
})

test("URL tidak terdaftar menampilkan halaman 404 beserta tautan pemulihan", async ({
    page,
}) => {
    await page.goto("/alamat-salah")
    await expect(
        page.getByRole("heading", { name: "Halaman tidak ditemukan" }),
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Ke halaman utama" })).toBeVisible()
    await expect(
        page.getByRole("link", { name: "Kembali ke daftar produk" }),
    ).toBeVisible()
    await page.screenshot({
        path: "test-results/tugas-4-404.png",
        fullPage: true,
    })
})

test("error backend ditampilkan dengan pesan yang jelas", async ({ page }) => {
    await page.unroute(`${API}**`)
    await page.route(`${API}**`, (route) =>
        route.fulfill({ status: 500, body: "error" }),
    )
    await page.goto("/products")
    await expect(page.getByRole("alert")).toContainText("HTTP 500")
    await expect(page.getByText("Belum ada produk.")).toBeVisible()
})
