import { NavLink } from "react-router"
import { TbPackage } from "react-icons/tb"

// Molecule: shared navigation rendered by the PageLayout template.
export default function Navbar() {
    return (
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <nav
                aria-label="Navigasi utama"
                className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8"
            >
                <NavLink
                    to="/products"
                    className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <TbPackage className="size-5" aria-hidden="true" />
                    </span>
                    Manajemen Produk
                </NavLink>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-sm">
                    <NavLink
                        to="/products"
                        end
                        className={({ isActive }) =>
                            `rounded-lg px-3 py-2 font-semibold transition-colors ${
                                isActive
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`
                        }
                    >
                        Produk
                    </NavLink>
                </div>
            </nav>
        </header>
    )
}
