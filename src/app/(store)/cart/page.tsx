"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart, Minus, Plus, Trash2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ClientCartItem,
    getGuestCartItems,
    removeGuestCartItem,
    updateGuestCartQuantity,
} from "@/lib/cart-client";

export default function CartPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ClientCartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            if (!session?.user?.id) {
                setItems(getGuestCartItems());
                return;
            }

            const res = await fetch("/api/cart");
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch cart:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [session?.user?.id]);

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        setUpdating(cartItemId);
        try {
            if (!session?.user?.id) {
                setItems(updateGuestCartQuantity(cartItemId, quantity));
                window.dispatchEvent(new Event("cart:updated"));
                return;
            }

            if (quantity <= 0) {
                await fetch("/api/cart", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItemId }),
                });
                setItems((prev) => prev.filter((item) => item.id !== cartItemId));
                window.dispatchEvent(new Event("cart:updated"));
            } else {
                await fetch("/api/cart", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItemId, quantity }),
                });
                setItems((prev) =>
                    prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
                );
                window.dispatchEvent(new Event("cart:updated"));
            }
        } catch (err) {
            console.error("Failed to update cart:", err);
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (cartItemId: string) => {
        try {
            if (!session?.user?.id) {
                setItems(removeGuestCartItem(cartItemId));
                window.dispatchEvent(new Event("cart:updated"));
                return;
            }

            await fetch("/api/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId }),
            });
            setItems((prev) => prev.filter((item) => item.id !== cartItemId));
            window.dispatchEvent(new Event("cart:updated"));
        } catch (err) {
            console.error("Failed to remove item:", err);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-12 border-b-2 border-foreground pb-6">SHOPPING CART</h1>

            {items.length === 0 ? (
                <div className="text-center py-32 border border-border">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-widest text-foreground">Your cart is empty</h3>
                    <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs font-bold">Start adding some pieces!</p>
                    <Link href="/products">
                        <Button className="mt-8 bg-foreground text-background hover:bg-foreground/90 rounded-none uppercase tracking-[0.2em] font-bold px-8 h-12">
                            BROWSE CATALOG
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-6 pb-8 border-b border-border">
                                <Link href={`/products/${item.product.slug}`} className="w-32 h-40 bg-secondary overflow-hidden flex-shrink-0 relative group">
                                    {item.product.images[0] ? (
                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0 flex flex-col pt-2">
                                    <Link href={`/products/${item.product.slug}`}>
                                        <h3 className="font-bold text-foreground uppercase tracking-widest hover:text-muted-foreground transition-colors mb-2">
                                            {item.product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-lg font-black text-foreground">
                                        ₹{item.product.price.toLocaleString("en-IN")}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center border border-foreground">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={updating === item.id}
                                                className="px-3 py-2 text-foreground hover:bg-muted border-r border-foreground"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 text-sm font-bold text-foreground min-w-[2.5rem] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                                                disabled={updating === item.id}
                                                className="px-3 py-2 text-foreground hover:bg-muted border-l border-foreground"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-secondary/30 p-8 sticky top-32">
                            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6">ORDER SUMMARY</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>SUBTOTAL ({items.length})</span>
                                    <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>DELIVERY</span>
                                    <span className="text-foreground">{subtotal >= 2000 ? "FREE" : "₹99"}</span>
                                </div>
                                <Separator className="my-6 bg-border" />
                                <div className="flex justify-between font-black uppercase tracking-tighter text-foreground items-end">
                                    <span className="text-lg">TOTAL</span>
                                    <span className="text-2xl">
                                        ₹{(subtotal + (subtotal >= 2000 ? 0 : 99)).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <Link href="/checkout" className="block mt-8">
                                    <Button className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background font-bold tracking-[0.2em] uppercase rounded-none">
                                        PROCEED TO CHECKOUT
                                    </Button>
                                </Link>
                                <Link href="/products" className="block mt-4">
                                    <Button variant="outline" className="w-full h-14 border-foreground text-foreground rounded-none font-bold tracking-[0.2em] uppercase">
                                        CONTINUE SHOPPING
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
