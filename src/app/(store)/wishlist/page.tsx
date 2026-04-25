"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface WishlistItem {
    id: string;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        compareAtPrice: number | null;
        images: string[];
        stock: number;
    };
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/wishlist")
            .then((res) => res.json())
            .then((data) => setItems(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const removeItem = async (wishlistItemId: string) => {
        try {
            await fetch("/api/wishlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wishlistItemId }),
            });
            setItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
        } catch (err) {
            console.error("Failed to remove:", err);
        }
    };

    const moveToCart = async (item: WishlistItem) => {
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: item.product.id, quantity: 1 }),
            });

            if (!res.ok) {
                throw new Error("Failed to move item to cart");
            }

            await removeItem(item.id);
            toast.success("Moved to cart");
            window.dispatchEvent(new Event("cart:updated"));
            window.dispatchEvent(new Event("cart:open"));
        } catch (err) {
            console.error("Failed to move to cart:", err);
            toast.error("Could not move item to cart");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Wishlist</h1>

            {items.length === 0 ? (
                <div className="text-center py-24">
                    <Heart className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600">Your wishlist is empty</h3>
                    <p className="text-slate-400 mt-2">Save items you love for later</p>
                    <Link href="/products">
                        <Button className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                            Browse Products
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                            <Link href={`/products/${item.product.slug}`}>
                                <div className="aspect-square bg-slate-50 overflow-hidden">
                                    {item.product.images[0] ? (
                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-12 h-12 text-slate-200" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="p-5">
                                <Link href={`/products/${item.product.slug}`}>
                                    <h3 className="font-semibold text-slate-800 hover:text-amber-700 transition-colors line-clamp-2">
                                        {item.product.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-lg font-bold text-slate-800">₹{item.product.price.toLocaleString("en-IN")}</span>
                                    {item.product.compareAtPrice && (
                                        <span className="text-sm text-slate-400 line-through">₹{item.product.compareAtPrice.toLocaleString("en-IN")}</span>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        onClick={() => moveToCart(item)}
                                        disabled={item.product.stock <= 0}
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm"
                                        size="sm"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-1" />
                                        {item.product.stock > 0 ? "Move to Cart" : "Out of Stock"}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
