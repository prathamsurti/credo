"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { name: string; email: string };
    items: { quantity: number }[];
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PROCESSING: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    SHIPPED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
            const res = await fetch(`/api/admin/orders${query}`);
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders</h1>
                    <p className="text-slate-400 mt-1">Track and manage customer orders</p>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] border-slate-700 bg-slate-800 text-white">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="border border-slate-800 shadow-sm bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                        Orders ({orders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Order</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Items</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-medium text-white">
                                                #{order.orderNumber.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm font-medium text-white">{order.user.name}</p>
                                                <p className="text-xs text-slate-400">{order.user.email}</p>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-300">
                                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={`${statusColors[order.status]} border font-medium text-xs`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm font-semibold text-white">
                                                ₹{order.totalAmount.toLocaleString("en-IN")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-amber-400">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
