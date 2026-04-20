"use client";

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Package, X } from "lucide-react";
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

    // Group products by category
    const groupedProducts = useMemo(() => {
        return products.reduce((acc, product) => {
            const catName = product.category?.name || 'Uncategorized';
            if (!acc[catName]) acc[catName] = [];
            acc[catName].push(product);
            return acc;
        }, {} as Record<string, Product[]>);
    }, [products]);

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background">
            {/* Header */}
            <div className="mb-12 border-b-2 border-foreground pb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">THE CATALOG</h1>
                </div>
                <p className="text-muted-foreground text-sm font-bold tracking-[0.2em] uppercase">
                    {total} PIECES
                </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search gifts..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-3">
                    <Select value={category || "all"} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name} ({cat._count.products})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="name">Name A-Z</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
                            <X className="w-4 h-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 glass-panel rounded-3xl mx-auto max-w-2xl mt-12 bg-black/80">
                    <Package className="w-16 h-16 mx-auto text-white/50 mb-4" />
                    <h3 className="text-xl font-semibold text-white">No products found</h3>
                    <p className="text-white/60 mt-2">Try adjusting your search or filters</p>
                    {hasFilters && (
                        <Button variant="outline" className="mt-6 border-white/20 hover:bg-white/10 text-white" onClick={clearFilters}>
                            Clear all filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group flex flex-col glass-panel rounded-2xl p-4 shadow-xl transition-transform duration-300 hover:-translate-y-2 bg-black hover:bg-black/90"
                        >
                            <div className="aspect-[4/5] bg-secondary/50 rounded-xl overflow-hidden relative mb-6">
                                {product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-white/40" />
                                    </div>
                                )}
                                {product.compareAtPrice && (
                                    <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-primary-foreground rounded-full text-xs font-bold tracking-widest px-4 py-1.5 uppercase shadow-lg">
                                        SALE
                                    </div>
                                )}
                            </div>
                            <div className="px-2">
                                <h3 className="font-bold text-white uppercase tracking-wide mb-2 line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-white">₹{product.price.toLocaleString("en-IN")}</span>
                                    {product.compareAtPrice && (
                                        <span className="text-white/60 line-through text-sm">₹{product.compareAtPrice.toLocaleString("en-IN")}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense>
            <ProductsContent />
        </Suspense>
    );
}
