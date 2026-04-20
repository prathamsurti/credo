"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: {
        id: string;
        quantity: number;
        priceAtTime: number;
        productName: string;
        productImage: string | null;
        product: { name: string; slug: string };
    }[];
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-indigo-100 text-indigo-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => res.json())
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-24">
                    <ShoppingCart className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600">No orders yet</h3>
                    <p className="text-slate-400 mt-2">Your order history will appear here</p>
                    <Link href="/products">
                        <button className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg">
                            Start Shopping
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Order header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-semibold text-slate-700">
                                            Order #{order.orderNumber.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={`${statusColors[order.status]} border-0 font-medium`}>
                                        {order.status}
                                    </Badge>
                                    <span className="font-bold text-slate-800">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* Order items */}
                            <div className="p-6 space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-slate-700 hover:text-amber-700 transition-colors">
                                                {item.productName}
                                            </Link>
                                            <p className="text-xs text-slate-400">Qty: {item.quantity} × ₹{item.priceAtTime.toLocaleString("en-IN")}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">
                                            ₹{(item.priceAtTime * item.quantity).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
