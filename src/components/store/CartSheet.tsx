"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
    ClientCartItem,
    getGuestCartItems,
    removeGuestCartItem,
    updateGuestCartQuantity,
} from "@/lib/cart-client";

interface CartSheetProps {
    triggerClassName?: string;
    iconClassName?: string;
    badgeClassName?: string;
}

const CART_UPDATED_EVENT = "cart:updated";
const CART_OPEN_EVENT = "cart:open";

export function CartSheet({
    triggerClassName,
    iconClassName,
    badgeClassName,
}: CartSheetProps) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ClientCartItem[]>([]);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchCart = async () => {
        if (!session?.user?.id) {
            setItems(getGuestCartItems());
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/cart", { cache: "no-store" });
            if (res.status === 401) {
                setItems([]);
                return;
            }
            if (!res.ok) {
                throw new Error("Unable to fetch cart");
            }
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Could not load cart items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchCart();
    }, [session?.user?.id]);

    useEffect(() => {
        const handleCartUpdated = () => {
            void fetchCart();
        };
        const handleCartOpen = () => {
            setOpen(true);
            void fetchCart();
        };

        window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
        window.addEventListener(CART_OPEN_EVENT, handleCartOpen);

        return () => {
            window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
            window.removeEventListener(CART_OPEN_EVENT, handleCartOpen);
        };
    }, [session?.user?.id]);

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        setUpdating(cartItemId);
        try {
            if (!session?.user?.id) {
                setItems(updateGuestCartQuantity(cartItemId, quantity));
                window.dispatchEvent(new Event(CART_UPDATED_EVENT));
                return;
            }

            if (quantity <= 0) {
                const res = await fetch("/api/cart", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItemId }),
                });
                if (!res.ok) {
                    throw new Error("Unable to remove item");
                }
                setItems((prev) => prev.filter((item) => item.id !== cartItemId));
            } else {
                const res = await fetch("/api/cart", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItemId, quantity }),
                });
                if (!res.ok) {
                    throw new Error("Unable to update quantity");
                }
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === cartItemId ? { ...item, quantity } : item
                    )
                );
            }
            window.dispatchEvent(new Event(CART_UPDATED_EVENT));
        } catch {
            toast.error("Could not update cart");
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (cartItemId: string) => {
        setUpdating(cartItemId);
        try {
            if (!session?.user?.id) {
                setItems(removeGuestCartItem(cartItemId));
                window.dispatchEvent(new Event(CART_UPDATED_EVENT));
                return;
            }

            const res = await fetch("/api/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId }),
            });
            if (!res.ok) {
                throw new Error("Unable to remove item");
            }
            setItems((prev) => prev.filter((item) => item.id !== cartItemId));
            window.dispatchEvent(new Event(CART_UPDATED_EVENT));
        } catch {
            toast.error("Could not remove item");
        } finally {
            setUpdating(null);
        }
    };

    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [items]
    );

    return (
        <Sheet
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (nextOpen) {
                    void fetchCart();
                }
            }}
        >
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Open cart"
                    className={cn("relative transition-colors", triggerClassName)}
                >
                    <ShoppingBag className={cn("w-5 h-5", iconClassName)} />
                    <span
                        className={cn(
                            "absolute -top-2 -right-2.5 bg-blue-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center",
                            badgeClassName
                        )}
                    >
                        {itemCount}
                    </span>
                </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full max-w-md p-0">
                <SheetHeader className="border-b border-border">
                    <SheetTitle className="text-lg font-black tracking-wide uppercase">Your Cart</SheetTitle>
                    <SheetDescription>
                        {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""}` : "No items yet"}
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="p-6">
                        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin mx-auto" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-6 text-center space-y-4">
                        <Package className="w-10 h-10 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/products">Continue shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 border border-border rounded-md p-3">
                                    <Link href={`/products/${item.product.slug}`} className="w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0">
                                        {item.product.images[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${item.product.slug}`}>
                                            <p className="text-sm font-semibold truncate">{item.product.name}</p>
                                        </Link>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ₹{item.product.price.toLocaleString("en-IN")}
                                        </p>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-border rounded-md">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={updating === item.id}
                                                    className="px-2 py-1 hover:bg-muted"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            Math.min(item.product.stock, item.quantity + 1)
                                                        )
                                                    }
                                                    disabled={updating === item.id}
                                                    className="px-2 py-1 hover:bg-muted"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                disabled={updating === item.id}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <Separator />
                            <div className="flex gap-2">
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/cart">View cart</Link>
                                </Button>
                                <Button asChild className="flex-1">
                                    <Link href="/checkout" className="inline-flex items-center justify-center gap-2">
                                        Checkout <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
