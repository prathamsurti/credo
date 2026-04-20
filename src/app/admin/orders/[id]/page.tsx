"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        zipCode: string;
    };
    notes: string | null;
    createdAt: string;
    user: { name: string; email: string; phone: string | null };
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetch(`/api/admin/orders/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setOrder(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-24 text-slate-400">Order not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Order #{order.orderNumber.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-sm text-slate-400">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
                <Badge className={`${statusColors[order.status]} border-0 text-sm px-3 py-1`}>
                    {order.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                        {item.productImage ? (
                                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-700 truncate">{item.productName}</p>
                                        <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-slate-700">
                                        ₹{(item.priceAtTime * item.quantity).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-lg font-semibold text-slate-700">Total</span>
                                <span className="text-xl font-bold text-slate-800">
                                    ₹{order.totalAmount.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Update Status */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={order.status} onValueChange={updateStatus} disabled={updating}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                                        (s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="font-medium text-slate-700">{order.user.name}</p>
                            <p className="text-slate-500">{order.user.email}</p>
                            {order.user.phone && <p className="text-slate-500">{order.user.phone}</p>}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 space-y-1">
                            <p className="font-medium text-slate-700">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.phone}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
