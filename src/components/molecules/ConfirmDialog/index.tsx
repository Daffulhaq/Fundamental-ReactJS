import { useEffect } from "react"
import Button from "../../atoms/Button"

type Props = {
    title: string
    message: string
    confirmLabel?: string
    isMutating?: boolean
    onConfirm: () => void
    onCancel: () => void
}

// Molecule: accessible confirmation modal used before destructive actions.
export default function ConfirmDialog({
    title,
    message,
    confirmLabel = "Hapus",
    isMutating = false,
    onConfirm,
    onCancel,
}: Props) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isMutating) onCancel()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isMutating, onCancel])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
                <h2 id="confirm-dialog-title" className="text-lg font-bold text-slate-900">
                    {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={onCancel} disabled={isMutating}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={onConfirm} disabled={isMutating}>
                        {isMutating ? "Menghapus…" : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}
