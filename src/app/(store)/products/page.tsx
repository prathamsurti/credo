"use client";

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Package, X, ArrowUp, Sun, Moon, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    category: { name: string; slug: string };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showStickyBar, setShowStickyBar] = useState(false);

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    // Scroll listener for sticky bar
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyBar(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        params.set("page", page.toString());

        try {
            const res = await fetch(`/api/products?${params}`);
            const data = await res.json();
            setProducts(prev => page === 1 ? (data.products || []) : [...prev, ...(data.products || [])]);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [search, category, sort, page]);

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setSort("newest");
        setPage(1);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasFilters = search || category || sort !== "newest";

    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && products.length < total) {
                setPage(p => p + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, products.length, total]);

    return (
        <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#181818] text-[#e5e5e5]' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
            {/* Header */}
            <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-[#181818]/90' : 'bg-white/90'} backdrop-blur-md px-4 md:px-8 py-5 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <Link href="/">
                    <div className="text-2xl font-bold tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity">Credo</div>
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/search" className="cursor-pointer hover:opacity-70 transition-opacity">
                        <Search className="w-5 h-5" />
                    </Link>
                    <Link href="/account" className="cursor-pointer hover:opacity-70 transition-opacity">
                        <span className="text-sm font-semibold tracking-widest">ACCOUNT</span>
                    </Link>
                    <Link href="/cart" className="relative cursor-pointer hover:opacity-70 transition-opacity">
                        <span className="text-sm font-semibold tracking-widest">CART</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                {/* Page Title */}
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">Shop</h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Discover our curated collection of premium products
                    </p>
                </div>

                {/* Filters Section */}
                <div className={`mb-12 pb-8 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
                        {/* Search */}
                        <div className="w-full lg:flex-1">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-3">Search</label>
                            <div className={`relative rounded-full overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-[#222]' : 'border-gray-300 bg-white'}`}>
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className={`w-full pl-12 pr-4 py-3 bg-transparent outline-none ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="w-full lg:w-48">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-3">Category</label>
                            <div className={`rounded-full overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-[#222]' : 'border-gray-300 bg-white'}`}>
                                <select
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                    className={`w-full px-4 py-3 bg-transparent outline-none appearance-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug} className="bg-gray-900">
                                            {cat.name} ({cat._count.products})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="w-full lg:w-48">
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 block mb-3">Sort</label>
                            <div className={`rounded-full overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-[#222]' : 'border-gray-300 bg-white'}`}>
                                <select
                                    value={sort}
                                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                                    className={`w-full px-4 py-3 bg-transparent outline-none appearance-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    <option value="newest" className="bg-gray-900">Newest</option>
                                    <option value="price-low" className="bg-gray-900">Price: Low to High</option>
                                    <option value="price-high" className="bg-gray-900">Price: High to Low</option>
                                    <option value="popular" className="bg-gray-900">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className={`px-6 py-3 rounded-full font-semibold text-sm tracking-wide transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {products.map((product, idx) => (
                            <div
                                key={product.id}
                                ref={idx === products.length - 1 ? lastProductElementRef : null}
                            >
                                <Link href={`/products/${product.slug}`}>
                                    <div className="group cursor-pointer">
                                        {/* Product Image */}
                                        <div className={`aspect-square rounded-2xl overflow-hidden mb-6 ${isDarkMode ? 'bg-[#222]' : 'bg-gray-100'}`}>
                                            {product.images[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-16 h-16 text-white/20" />
                                                </div>
                                            )}
                                            {product.compareAtPrice && (
                                                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    SALE
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div>
                                            <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {product.category.name}
                                            </div>
                                            <h3 className={`font-semibold text-lg mb-3 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-xl">₹{product.price.toLocaleString("en-IN")}</span>
                                                {product.compareAtPrice && (
                                                    <span className={`text-sm line-through opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        ₹{product.compareAtPrice.toLocaleString("en-IN")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : !loading && (
                    <div className="text-center py-20">
                        <Package className={`w-16 h-16 mx-auto mb-6 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                        <h3 className="text-2xl font-bold mb-2">No products found</h3>
                        <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Try adjusting your search or filters
                        </p>
                        <button
                            onClick={clearFilters}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Show More Indicator */}
                {products.length < total && !loading && (
                    <div className="text-center py-8">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing {products.length} of {total} products
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className={`${isDarkMode ? 'bg-[#111] border-[#222]' : 'bg-gray-100 border-gray-200'} border-t pt-16 pb-8 mt-20`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold tracking-widest uppercase mb-6">Credo</h3>
                            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Premium quality products for every need. Experience excellence in design and functionality.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6 tracking-widest uppercase text-sm">Collections</h4>
                            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {categories.slice(0, 4).map((cat) => (
                                    <li key={cat.id}>
                                        <Link href={`/products?category=${cat.slug}`} className="hover:text-white transition-colors">
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-6 tracking-widest uppercase text-sm">Company</h4>
                            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link href="/products" className="hover:text-white transition-colors">Shop</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className={`flex flex-col md:flex-row justify-between items-center pt-8 border-t ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-300 text-gray-600'} text-sm gap-4`}>
                        <div>© 2026 - Credo Store. All rights reserved.</div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <span>·</span>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-4 md:right-8 flex flex-col gap-3 z-40">
                <button
                    onClick={scrollToTop}
                    className={`p-3 rounded-full shadow-lg ${isDarkMode ? 'bg-[#222] text-gray-400 hover:text-white border border-gray-700' : 'bg-white text-gray-600 hover:text-black border border-gray-200'} transition-all`}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-3 rounded-full shadow-lg ${isDarkMode ? 'bg-[#222] text-gray-400 hover:text-white border border-gray-700' : 'bg-white text-gray-600 hover:text-black border border-gray-200'} transition-all`}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
