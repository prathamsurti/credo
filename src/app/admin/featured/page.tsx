"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Package, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
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
    images: string[];
    category: { name: string };
    isFeatured: boolean;
    bannerImage?: string;
    createdAt: string;
}

export default function FeaturedProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);
    const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [bannerImageUrl, setBannerImageUrl] = useState("");
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const toggleFeatured = async (productId: string, currentStatus: boolean) => {
        if (!currentStatus) {
            // Opening feature dialog when trying to feature a product
            const product = products.find((p) => p.id === productId);
            if (product) {
                setSelectedProduct(product);
                setBannerImageUrl(product.bannerImage || "");
                setBannerDialogOpen(true);
            }
        } else {
            // Removing from featured
            setUpdating(productId);
            try {
                const res = await fetch(`/api/admin/products/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isFeatured: false, bannerImage: null }),
                });

                if (res.ok) {
                    setProducts((prev) =>
                        prev.map((p) =>
                            p.id === productId
                                ? { ...p, isFeatured: false, bannerImage: undefined }
                                : p
                        )
                    );
                }
            } catch (err) {
                console.error("Failed to update product:", err);
            } finally {
                setUpdating(null);
            }
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingBanner(true);
        try {
            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: fd,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to upload image");
            }

            setBannerImageUrl(data.url);
        } catch (err) {
            console.error("Failed to upload banner:", err);
        } finally {
            setUploadingBanner(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSaveFeatured = async () => {
        if (!selectedProduct) return;
        setUpdating(selectedProduct.id);

        try {
            const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isFeatured: true,
                    bannerImage: bannerImageUrl || null,
                }),
            });

            if (res.ok) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === selectedProduct.id
                            ? { ...p, isFeatured: true, bannerImage: bannerImageUrl || undefined }
                            : p
                    )
                );
                setBannerDialogOpen(false);
                setSelectedProduct(null);
                setBannerImageUrl("");
            }
        } catch (err) {
            console.error("Failed to update product:", err);
        } finally {
            setUpdating(null);
        }
    };

    const featuredProducts = products.filter((p) => p.isFeatured);
    const nonFeaturedProducts = products.filter((p) => !p.isFeatured);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Featured Products</h1>
                <p className="text-slate-400 mt-1">
                    Manage products displayed on the hero section
                </p>
            </div>

            {/* Featured Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card className="border border-slate-800 shadow-sm bg-gradient-to-br from-amber-950 to-orange-950">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">
                                    Featured Products
                                </p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {featuredProducts.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Star className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-800 shadow-sm bg-gradient-to-br from-blue-950 to-indigo-950">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">
                                    Total Products
                                </p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {products.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
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

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        Featured
                    </h2>
                    <Card className="border border-slate-800 shadow-sm bg-slate-900">
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {featuredProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                            {product.images[0] ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-5 h-5 text-slate-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-white">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-slate-300">
                                                        {product.category.name}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm font-semibold text-white">
                                                        ₹{product.price.toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        className={`border text-xs ${
                                                            product.stock <= 5
                                                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                                : "bg-green-500/20 text-green-400 border-green-500/30"
                                                        }`}
                                                    >
                                                        {product.stock} units
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleFeatured(
                                                                product.id,
                                                                product.isFeatured
                                                            )
                                                        }
                                                        disabled={updating === product.id}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                                    >
                                                        <Star className="w-4 h-4 mr-1 fill-white" />
                                                        {updating === product.id
                                                            ? "Updating..."
                                                            : "Remove"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Non-Featured Products Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-400" />
                    Available Products ({nonFeaturedProducts.length})
                </h2>
                <Card className="border border-slate-800 shadow-sm bg-slate-900">
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                            </div>
                        ) : nonFeaturedProducts.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">No products available</p>
                                <p className="text-sm mt-1">All products are already featured.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nonFeaturedProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                            {product.images[0] ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-5 h-5 text-slate-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-white">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-slate-300">
                                                        {product.category.name}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm font-semibold text-white">
                                                        ₹{product.price.toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        className={`border text-xs ${
                                                            product.stock <= 5
                                                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                                : "bg-green-500/20 text-green-400 border-green-500/30"
                                                        }`}
                                                    >
                                                        {product.stock} units
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleFeatured(
                                                                product.id,
                                                                product.isFeatured
                                                            )
                                                        }
                                                        disabled={updating === product.id}
                                                        className="bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white"
                                                    >
                                                        <Star className="w-4 h-4 mr-1" />
                                                        {updating === product.id
                                                            ? "Updating..."
                                                            : "Feature"}
                                                    </Button>
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

            {/* Banner Image Dialog */}
            <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
                <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Feature Product</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Upload a banner image for {selectedProduct?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-white">Banner Image</Label>
                            <p className="text-xs text-slate-400">
                                Recommended size: 1600x900px. This will be displayed on the hero section.
                            </p>
                        </div>

                        {/* Image Preview or Upload Area */}
                        {bannerImageUrl ? (
                            <div className="relative w-full h-40 border-2 border-slate-700 rounded-lg overflow-hidden bg-slate-800">
                                <img
                                    src={bannerImageUrl}
                                    alt="Banner Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setBannerImageUrl("")}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-full h-40 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                                {uploadingBanner ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-400">
                                            Click to upload banner
                                        </p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerUpload}
                                    disabled={uploadingBanner}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        )}

                        {!bannerImageUrl && (
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingBanner}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {uploadingBanner ? "Uploading..." : "Choose Image"}
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setBannerDialogOpen(false);
                                setSelectedProduct(null);
                                setBannerImageUrl("");
                            }}
                            className="border-slate-700 text-white hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveFeatured}
                            disabled={updating === selectedProduct?.id}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {updating === selectedProduct?.id ? "Saving..." : "Feature Product"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
