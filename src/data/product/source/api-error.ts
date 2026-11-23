import type { ProductFieldErrors } from "../model/product-input.ts"

// Carries HTTP status and backend field errors so pages can show precise messages.
export default class ApiError extends Error {
    readonly status: number
    readonly fieldErrors: ProductFieldErrors

    constructor(
        message: string,
        status: number,
        fieldErrors: ProductFieldErrors = {},
    ) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.fieldErrors = fieldErrors
    }
}
