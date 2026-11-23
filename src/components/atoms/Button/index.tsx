import type { ButtonHTMLAttributes } from "react"

const variants = {
    primary:
        "border-blue-600 bg-blue-600 text-white shadow-sm hover:border-blue-700 hover:bg-blue-700",
    secondary:
        "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    danger:
        "border-red-600 bg-red-600 text-white shadow-sm hover:border-red-700 hover:bg-red-700",
    subtleDanger:
        "border-red-100 bg-red-50/60 text-red-600 hover:border-red-200 hover:bg-red-50",
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants
}

// Atom: the shared interactive style lives here, variants are chosen via props.
export default function Button({
    variant = "primary",
    className = "",
    type = "button",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
