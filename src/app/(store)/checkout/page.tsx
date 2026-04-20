"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        images: string[];
        stock: number;
    };
}

export default function CheckoutPage() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [error, setError] = useState("");

    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetch("/api/cart")
            .then((res) => res.json())
            .then((data) => {
                const cartData = Array.isArray(data) ? data : [];
                setItems(cartData);
                if (cartData.length === 0) router.replace("/cart");
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [router]);

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const delivery = subtotal >= 2000 ? 0 : 99;
    const total = subtotal + delivery;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setPlacing(true);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shippingAddress: address, notes }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to place order");
                return;
            }

            setOrderPlaced(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Order Placed Successfully!</h2>
                <p className="text-slate-500 mt-3">
                    Thank you for your order. You&apos;ll receive a confirmation shortly.
                </p>
                <div className="flex gap-3 justify-center mt-8">
                    <Link href="/account/orders">
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                            View Orders
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="outline">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/cart">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Checkout</h1>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                        )}

                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-amber-600" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={address.fullName}
                                            onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            value={address.phone}
                                            onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Address Line 1</Label>
                                    <Input
                                        value={address.addressLine1}
                                        onChange={(e) => setAddress((p) => ({ ...p, addressLine1: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address Line 2 (Optional)</Label>
                                    <Input
                                        value={address.addressLine2}
                                        onChange={(e) => setAddress((p) => ({ ...p, addressLine2: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input
                                            value={address.city}
                                            onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input
                                            value={address.state}
                                            onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>PIN Code</Label>
                                        <Input
                                            value={address.zipCode}
                                            onChange={(e) => setAddress((p) => ({ ...p, zipCode: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Order Notes (Optional)</Label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any special instructions for your order..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="border-0 shadow-sm sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-lg">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product.images[0] ? (
                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{item.product.name}</p>
                                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">
                                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Delivery</span>
                                        <span className={delivery === 0 ? "text-green-600" : ""}>
                                            {delivery === 0 ? "Free" : `₹${delivery}`}
                                        </span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-slate-800">
                                    <span>Total</span>
                                    <span className="text-xl">₹{total.toLocaleString("en-IN")}</span>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={placing}
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-200/50"
                                >
                                    {placing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Placing Order...
                                        </div>
                                    ) : (
                                        `Place Order • ₹${total.toLocaleString("en-IN")}`
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
