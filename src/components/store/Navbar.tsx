"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Search,
    Menu,
    X,
    User,
    LogOut,
    Package,
    ChevronDown,
    Gift,
    Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CartSheet } from "@/components/store/CartSheet";

export default function StoreNavbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const signInHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
            setSearchOpen(false);
        }
    };

    return (
        <>
            <nav className="absolute top-0 w-full z-50 bg-black/20 backdrop-blur-xl text-white border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 shrink-0">
                            <span className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">
                                CREDO
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-6">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-[14px] font-semibold transition-colors hover:text-blue-400">
                                    New & Featured <ChevronDown className="w-4 h-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark">
                                    <DropdownMenuItem>New Arrivals</DropdownMenuItem>
                                    <DropdownMenuItem>Featured Collections</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-[14px] font-semibold transition-colors hover:text-blue-400">
                                    Best sellers <ChevronDown className="w-4 h-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark">
                                    <DropdownMenuItem>Trending Now</DropdownMenuItem>
                                    <DropdownMenuItem>All-Time Favorites</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href="/sale" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors">
                                50% OFF
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-[14px] font-semibold transition-colors hover:text-blue-400">
                                    Shop by devices <ChevronDown className="w-4 h-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark">
                                    <DropdownMenuItem>iPhone Cases</DropdownMenuItem>
                                    <DropdownMenuItem>Samsung Cases</DropdownMenuItem>
                                    <DropdownMenuItem>Google Pixel</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href="/about" className="text-[14px] font-semibold transition-colors hover:text-blue-400">
                                About us
                            </Link>

                            <Link href="/blog" className="text-[14px] font-semibold transition-colors hover:text-blue-400">
                                Blog
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-[14px] font-semibold transition-colors hover:text-blue-400">
                                    Theme Features <ChevronDown className="w-4 h-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark">
                                    <DropdownMenuItem>Design Options</DropdownMenuItem>
                                    <DropdownMenuItem>Customization</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-5">
                            <button onClick={() => setSearchOpen(true)} className="text-white hover:text-blue-400 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>

                            {session ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="text-white hover:text-blue-400 transition-colors focus:outline-none">
                                        <User className="w-5 h-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <div className="flex items-center justify-start gap-2 p-2">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/account/orders" className="cursor-pointer">
                                                <Package className="mr-2 h-4 w-4" />
                                                <span>My Orders</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {session.user?.role === "ADMIN" && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="cursor-pointer">
                                                    <Gift className="mr-2 h-4 w-4" />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href={signInHref} className="text-white hover:text-blue-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </Link>
                            )}

                            <CartSheet
                                triggerClassName="text-white hover:text-blue-400 group"
                                iconClassName="w-5 h-5"
                                badgeClassName="group-hover:scale-110 transition-transform"
                            />
                        </div>

                        {/* Mobile controls */}
                        <div className="lg:hidden flex items-center gap-5">
                            <button onClick={() => setSearchOpen(true)} className="text-white">
                                <Search className="w-6 h-6" />
                            </button>
                            <CartSheet
                                triggerClassName="text-white"
                                iconClassName="w-6 h-6"
                                badgeClassName="-top-1.5 -right-2"
                            />

                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="text-white p-1">
                                        <Menu className="w-6 h-6" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="bg-background border-l-border sm:max-w-xs">
                                    <SheetHeader className="text-left mb-6 mt-4">
                                        <SheetTitle className="text-2xl font-black uppercase tracking-widest text-foreground">
                                            CREDO
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-4 text-base font-semibold">
                                            <Link href="/new" className="hover:text-primary transition-colors">New & Featured</Link>
                                            <Link href="/bestsellers" className="hover:text-primary transition-colors">Best sellers</Link>
                                            <Link href="/sale" className="text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-2">
                                                50% OFF Sale <Badge variant="secondary" className="bg-blue-100 text-blue-700">HOT</Badge>
                                            </Link>
                                            <Link href="/devices" className="hover:text-primary transition-colors">Shop by devices</Link>
                                            <Link href="/about" className="hover:text-primary transition-colors">About us</Link>
                                            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                                        </div>

                                        <div className="h-px bg-border my-2" />

                                        {session ? (
                                            <div className="flex flex-col gap-4 text-base font-medium text-muted-foreground">
                                                <Link href="/account/orders" className="hover:text-primary flex items-center gap-3">
                                                    <Package className="w-5 h-5" /> My Orders
                                                </Link>
                                                {session.user?.role === "ADMIN" && (
                                                    <Link href="/admin" className="hover:text-primary flex items-center gap-3">
                                                        <Gift className="w-5 h-5" /> Admin Panel
                                                    </Link>
                                                )}
                                                <button onClick={() => signOut()} className="text-left hover:text-red-500 flex items-center gap-3 transition-colors">
                                                    <LogOut className="w-5 h-5" /> Sign out
                                                </button>
                                            </div>
                                        ) : (
                                            <Button asChild className="w-full">
                                                <Link href={signInHref}>Sign In</Link>
                                            </Button>
                                        )}

                                        <div className="mt-auto pt-6 pb-2 flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Theme Mode</span>
                                            <ThemeToggle />
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl flex items-start justify-center pt-24 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-full max-w-2xl mx-4 bg-white/5 border border-white/10 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-3xl backdrop-blur-2xl">
                        <form onSubmit={handleSearch} className="flex gap-4 items-center border-b border-white/20 pb-2">
                            <Search className="w-6 h-6 text-white shrink-0" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full text-xl bg-transparent font-light text-white placeholder:text-white/50 focus:outline-none"
                            />
                            <button type="button" onClick={() => setSearchOpen(false)} className="text-white hover:text-white/70 p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}