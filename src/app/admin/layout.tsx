"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ShoppingCart,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Gift,
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Featured", href: "/admin/featured", icon: Star },
    { label: "Categories", href: "/admin/categories", icon: FolderOpen },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#1E1E1E]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-white">Credo</span>
                            <span className="text-[10px] block text-slate-400 -mt-1 font-medium uppercase tracking-wider">
                                Admin
                            </span>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 shadow-sm"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                <span className="flex-1">{item.label}</span>
                                {active && <ChevronRight className="w-4 h-4 text-amber-400" />}
                            </Link>
                        );
                    })}
                </nav>

                <Separator className="my-2" />

                {/* Logout */}
                <div className="p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mr-4 text-slate-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1" />
                    <Link href="/" className="text-sm text-slate-400 hover:text-amber-400 transition-colors font-medium">
                        View Store →
                    </Link>
                </header>

                {/* Page content */}
                <main className="p-6 bg-[#1E1E1E]">{children}</main>
            </div>
        </div>
    );
}
