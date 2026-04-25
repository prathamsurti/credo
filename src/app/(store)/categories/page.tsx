"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, Package, ArrowRight } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    _count: { products: number };
    products?: {
        id: string;
        name: string;
        slug: string;
        images: string[];
    }[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row items-baseline justify-between">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">THE ARCHIVES</h1>
                    <p className="text-white/50 mt-2 text-sm font-bold tracking-[0.2em] uppercase">Browse our curated collections</p>
                </div>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-24 glass-panel rounded-3xl mx-auto max-w-2xl bg-[#1E1E1E]/80">
                    <FolderOpen className="w-16 h-16 mx-auto text-white/50 mb-4" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">No archives yet</h3>
                    <p className="text-white/50 mt-2">Check back soon for new pieces</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {categories.map((cat, idx) => (
                        <div
                            key={cat.id}
                            className="min-w-[85vw] sm:min-w-[400px] md:min-w-[480px] relative h-[450px] overflow-hidden rounded-[2.5rem] glass-panel bg-[#1E1E1E] border border-white/10 flex flex-col p-8 shadow-xl shrink-0 snap-center group hover:border-white/20 transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 z-10 backdrop-blur-[2px] group-hover:backdrop-blur-none" />
                            {cat.image ? (
                                <img src={cat.image} className="absolute inset-y-0 right-0 h-full w-full object-cover z-0 transition-transform duration-1000 group-hover:scale-105 opacity-60" alt={cat.name} />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-white/10 to-transparent z-0 opacity-20" />
                            )}
                            
                            <div className="relative z-20 flex flex-col items-start w-full h-full">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">0{idx + 1}</p>
                                <h3 className="font-black text-3xl sm:text-4xl uppercase text-white mb-2 group-hover:text-white transition-colors drop-shadow-md">
                                    {cat.name}
                                </h3>
                                {cat.description && (
                                    <p className="text-sm text-white/80 mt-2 line-clamp-2 mb-4 font-medium max-w-[75%]">{cat.description}</p>
                                )}
                                
                                <div className="flex items-center gap-4 mt-2 mb-auto">
                                    <Link href={`/products?category=${cat.slug}`}>
                                        <button className="rounded-full bg-white text-black hover:bg-white/90 px-6 py-3 text-xs font-bold transition-all shadow-lg tracking-widest uppercase">
                                            EXPLORE ALL
                                        </button>
                                    </Link>
                                    <span className="text-xs text-white/80 font-bold tracking-widest uppercase">{cat._count.products} ITEMS</span>
                                </div>

                                {/* Bottom row: Top 3 newer products */}
                                {cat.products && cat.products.length > 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start gap-4 z-20 w-full overflow-x-auto pb-2">
                                        {cat.products.slice(0, 3).map((product) => (
                                            <Link 
                                                href={`/products/${product.slug}`} 
                                                key={product.id}
                                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/60 backdrop-blur-md shadow-xl border border-white/10 hover:border-white/20 hover:bg-black/80 transition-all hover:-translate-y-1 min-w-[80px] max-w-[100px] shrink-0"
                                            >
                                                <div className="w-12 h-12 relative mb-2">
                                                    {product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg drop-shadow-md" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
                                                            <Package className="w-5 h-5 text-white/40" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-white text-center w-full truncate px-1 uppercase tracking-wider">
                                                    {product.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
