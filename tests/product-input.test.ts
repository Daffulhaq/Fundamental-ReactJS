import { test } from "node:test"
import assert from "node:assert/strict"
import {
    parseProductValues,
    validateProductValues,
} from "../src/data/product/model/product-input.ts"

test("form values from text inputs are trimmed and parsed", () => {
    assert.deepEqual(parseProductValues("  Buku Tulis ", " 12000 "), {
        name: "Buku Tulis",
        price: 12000,
    })
})

test("client validation follows the backend product contract", () => {
    assert.deepEqual(validateProductValues({ name: "Pulpen", price: 5000 }), {})

    const errors = validateProductValues({ name: " ", price: 1.5 })
    assert.equal(errors.name, "Nama produk wajib diisi.")
    assert.match(errors.price ?? "", /bilangan bulat/)

    assert.match(
        validateProductValues({ name: "a".repeat(101), price: 1000 }).name ?? "",
        /100 karakter/,
    )
    assert.match(
        validateProductValues({ name: "Pulpen", price: 2_000_000_001 }).price ?? "",
        /terlalu besar/,
    )
})
