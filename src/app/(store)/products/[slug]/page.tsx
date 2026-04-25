"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    ShoppingCart,
    Heart,
    Minus,
    Plus,
    Package,
    ArrowLeft,
    Check,
    Star,
    ArrowUp,
    Sun,
    Moon,
    Search,
    User,
    Menu,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addProductToGuestCart } from "@/lib/cart-client";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    stock: number;
    minOrder: number;
    tags: string[];
    category: { name: string; slug: string };
}

interface RelatedProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { data: session } = useSession();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showStickyBar, setShowStickyBar] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data.product);
                setRelatedProducts(data.relatedProducts || []);
                setQuantity(data.product?.minOrder || 1);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    const handleAddToCart = async () => {
        setAddingToCart(true);
        try {
            if (session?.user?.id) {
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: product!.id, quantity }),
                });

                if (!res.ok) {
                    throw new Error("Failed to add product to cart");
                }
            } else {
                addProductToGuestCart(
                    {
                        id: product!.id,
                        name: product!.name,
                        slug: product!.slug,
                        price: product!.price,
                        images: product!.images,
                        stock: product!.stock,
                        minOrder: product!.minOrder,
                    },
                    quantity
                );
            }

            setAddedToCart(true);
            toast.success("Added to cart");
            window.dispatchEvent(new Event("cart:updated"));
            window.dispatchEvent(new Event("cart:open"));
            setTimeout(() => setAddedToCart(false), 2000);
        } catch {
            toast.error("Could not add this item to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        if (!session) {
            window.location.href = `/login?callbackUrl=/products/${slug}`;
            return;
        }
        setAddingToWishlist(true);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product!.id }),
            });
        } catch (err) {
            console.error("Failed to add to wishlist:", err);
        } finally {
            setAddingToWishlist(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="w-10 h-10 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 py-32 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Product not found</h2>
                <Link href="/products">
                    <Button variant="outline" className="mt-8 border-foreground text-foreground">BROWSE CATALOG</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-black">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-12 border-b border-white/10 pb-6">
                <Link href="/" className="hover:text-white transition-colors">HOME</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-white transition-colors">CATALOG</Link>
                <span>/</span>
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-white transition-colors">
                    {product.category.name}
                </Link>
                <span>/</span>
                <span className="text-white">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] overflow-hidden bg-secondary/20 relative glass-panel rounded-2xl border border-white/5">
                        {product.images[selectedImage] ? (
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-20 h-20 text-white/30" />
                            </div>
                        )}
                        {product.compareAtPrice && (
                            <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground backdrop-blur-md rounded-full shadow-lg text-xs font-bold tracking-widest px-4 py-2 uppercase">
                                SALE
                            </div>
                        )}
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-24 h-32 overflow-hidden flex-shrink-0 transition-all rounded-xl border ${selectedImage === idx ? "opacity-100 border-white ring-2 ring-white/50 ring-offset-2 ring-offset-black" : "opacity-60 hover:opacity-100 border-white/10"
                                        }`}
                                >
                                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col pt-4 lg:pt-10">
                    <div className="mb-8">
                        <Link href={`/products?category=${product.category.slug}`}>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50 mb-4 block hover:text-white transition-colors">
                                {product.category.name}
                            </span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9]">{product.name}</h1>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-4 mb-8">
                        <span className="text-3xl lg:text-4xl font-black text-white">
                            ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.compareAtPrice && (
                            <>
                                <span className="text-xl text-white/50 line-through pb-1 border-b border-white/20 block">
                                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <div className="prose max-w-none mb-12">
                        <p className="text-white/80 font-medium leading-relaxed whitespace-pre-wrap text-lg">{product.description}</p>
                    </div>

                    {/* Stock & Actions */}
                    <div className="mt-auto border-t border-white/10 pt-8 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-none shadow-[0_0_8px_currentColor] ${product.stock > 0 ? "bg-white text-white" : "bg-red-500 text-red-500"}`} />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                                {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
                            </span>
                        </div>

                        {product.stock > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">QUANTITY</span>
                                    <div className="flex items-center border border-white/20 rounded-md overflow-hidden bg-white/5 backdrop-blur-md">
                                        <button
                                            onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                                            className="px-4 py-3 text-white hover:bg-white/10 transition-colors border-r border-white/20"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-6 py-3 font-bold text-white min-w-[3rem] text-center bg-transparent">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="px-4 py-3 text-white hover:bg-white/10 transition-colors border-l border-white/20"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {product.minOrder > 1 && (
                                        <span className="text-xs font-bold tracking-widest text-white/50 uppercase">
                                            MIN ORDER: {product.minOrder}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="flex-1 h-14 bg-white text-black hover:bg-white/90 text-sm font-bold uppercase tracking-[0.2em] transition-all rounded-md shadow-lg shadow-white/10"
                                    >
                                        {addedToCart ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <Check className="w-5 h-5 border-black text-black" />
                                                ADDED TO CART
                                            </div>
                                        ) : addingToCart ? (
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
                                        ) : (
                                            "ADD TO CART"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleAddToWishlist}
                                        disabled={addingToWishlist}
                                        className="h-14 px-8 border-white/20 text-white bg-white/5 hover:bg-white hover:text-black rounded-md transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md"
                                    >
                                        {addingToWishlist ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Heart className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="bg-white/10 text-white border border-white/5 hover:bg-white/20 rounded-md tracking-widest uppercase text-[10px] font-black backdrop-blur-sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="mt-32 border-t border-border pt-20">
                    <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-12">THE EDIT</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {relatedProducts.map((rp) => (
                            <Link
                                key={rp.id}
                                href={`/products/${rp.slug}`}
                                className="group flex flex-col"
                            >
                                <div className="aspect-[4/5] bg-secondary overflow-hidden relative mb-4">
                                    {rp.images[0] ? (
                                        <img
                                            src={rp.images[0]}
                                            alt={rp.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[50%] group-hover:grayscale-0"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground uppercase tracking-wide line-clamp-1 mb-1">{rp.name}</h3>
                                    <p className="font-semibold text-foreground">₹{rp.price.toLocaleString("en-IN")}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
