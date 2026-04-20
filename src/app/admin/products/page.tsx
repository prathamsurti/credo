"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Package, Edit, Trash2, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    images: string[];
    category: { name: string };
    createdAt: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products?search=${search}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" });
            setProducts((prev) => prev.filter((p) => p.id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            console.error("Failed to delete:", err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products</h1>
                    <p className="text-slate-400 mt-1">Manage your product inventory</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                    <Link href="/admin/products/bulk">
                        <Button variant="outline" className="w-full sm:w-auto shrink-0">
                            <Upload className="mr-2 w-4 h-4" />
                            BULK UPLOAD
                        </Button>
                    </Link>
                    <Link href="/admin/products/new">
                        <Button className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-200/50">
                            <Plus className="mr-2 w-4 h-4" />
                            ADD PRODUCT
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <Card className="border border-slate-800 shadow-sm bg-slate-900">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="border border-slate-800 shadow-sm bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                        All Products ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm mt-1">Start by adding your first product.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Product</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Stock</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-slate-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{product.name}</p>
                                                        {product.isFeatured && (
                                                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] mt-0.5">Featured</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-300">{product.category.name}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-semibold text-white">₹{product.price.toLocaleString("en-IN")}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={`border text-xs ${
                                                    product.stock <= 5
                                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                        : product.stock <= 20
                                                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                            : "bg-green-500/20 text-green-400 border-green-500/30"
                                                }`}>
                                                    {product.stock} units
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={`border text-xs ${
                                                    product.isActive 
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                                        : "bg-slate-700 text-slate-400 border-slate-600"
                                                }`}>
                                                    {product.isActive ? "Active" : "Draft"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/products/${product.slug}`}>
                                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-amber-400">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-400 hover:text-red-400"
                                                        onClick={() => setDeleteId(product.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
