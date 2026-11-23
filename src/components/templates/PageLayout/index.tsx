import { Outlet } from "react-router"
import Navbar from "../../molecules/Navbar"

// Template: shared shell for every route, including the 404 page.
export default function PageLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-page">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
                <Outlet />
            </main>
            <footer className="border-t border-slate-200 px-5 py-6 text-center text-xs text-slate-500 sm:px-8">
                React Router · Tailwind CSS · Atomic Design · Tugas 4
            </footer>
        </div>
    )
}
