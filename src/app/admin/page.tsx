import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import {
    Package,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getDashboardData() {
    const [totalProducts, totalOrders, lowStockProducts, recentOrders] = await Promise.all([
        db.product.count(),
        db.order.count(),
        db.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
        db.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
                items: true,
            },
        }),
    ]);

    const totalRevenue = await db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: "CANCELLED" } },
    });

    return {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        lowStockProducts,
        recentOrders,
    };
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    CONFIRMED: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    PROCESSING: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    SHIPPED: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    DELIVERED: "bg-green-500/20 text-green-400 border border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default async function AdminDashboard() {
    const data = await getDashboardData();

    const stats = [
        {
            title: "Total Revenue",
            value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,
            icon: DollarSign,
            gradient: "from-emerald-500 to-teal-600",
            bgGradient: "from-emerald-950 to-teal-950",
        },
        {
            title: "Total Orders",
            value: data.totalOrders,
            icon: ShoppingCart,
            gradient: "from-blue-500 to-indigo-600",
            bgGradient: "from-blue-950 to-indigo-950",
        },
        {
            title: "Products",
            value: data.totalProducts,
            icon: Package,
            gradient: "from-amber-500 to-orange-600",
            bgGradient: "from-amber-950 to-orange-950",
        },
        {
            title: "Low Stock",
            value: data.lowStockProducts,
            icon: AlertTriangle,
            gradient: "from-red-500 to-rose-600",
            bgGradient: "from-red-950 to-rose-950",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className={`border border-slate-800 bg-gradient-to-br ${stat.bgGradient} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <Card className="border border-slate-800 shadow-sm bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white">Recent Orders</CardTitle>
                    <a href="/admin/orders" className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                        View all <ArrowUpRight className="w-4 h-4" />
                    </a>
                </CardHeader>
                <CardContent>
                    {data.recentOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No orders yet</p>
                            <p className="text-sm">Orders will appear here once customers start purchasing.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Order</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium text-white">
                                                    #{order.orderNumber.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm font-medium text-white">{order.user.name}</p>
                                                <p className="text-xs text-slate-400">{order.user.email}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={`${statusColors[order.status]} border-0 font-medium text-xs`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="text-sm font-semibold text-white">
                                                    ₹{order.totalAmount.toLocaleString("en-IN")}
                                                </span>
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
