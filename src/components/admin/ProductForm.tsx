"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
}

interface ProductFormProps {
    initialData?: {
        id: string;
        name: string;
        description: string;
        price: number;
        compareAtPrice: number | null;
        categoryId: string;
        stock: number;
        minOrder: number;
        isActive: boolean;
        isFeatured: boolean;
        tags: string[];
        images: string[];
    };
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price != null ? String(initialData.price) : "",
        compareAtPrice: initialData?.compareAtPrice != null ? String(initialData.compareAtPrice) : "",
        categoryId: initialData?.categoryId || "",
        stock: initialData?.stock != null ? String(initialData.stock) : "0",
        minOrder: initialData?.minOrder != null ? String(initialData.minOrder) : "1",
        isActive: initialData?.isActive ?? true,
        isFeatured: initialData?.isFeatured ?? false,
        tags: initialData?.tags || [] as string[],
        images: initialData?.images || [] as string[],
    });

    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        fetch("/api/admin/categories")
            .then((res) => res.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        const newImages: string[] = [];

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (res.ok) {
                    newImages.push(data.url);
                }
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }

        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const url = initialData
                ? `/api/admin/products/${initialData.id}`
                : "/api/admin/products";
            const method = initialData ? "PUT" : "POST";

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice !== "" ? parseFloat(formData.compareAtPrice) : null,
                stock: parseInt(formData.stock),
                minOrder: parseInt(formData.minOrder),
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to save product");
                return;
            }

            router.push("/admin/products");
            router.refresh();
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">
                    {initialData ? "Edit Product" : "New Product"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Premium Gift Hamper"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Describe the product..."
                                rows={5}
                                required
                                minLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(val) => setFormData((p) => ({ ...p, categoryId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Inventory */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Compare at Price (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.compareAtPrice}
                                    onChange={(e) => setFormData((p) => ({ ...p, compareAtPrice: e.target.value }))}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Minimum Order</Label>
                                <Input
                                    type="number"
                                    value={formData.minOrder}
                                    onChange={(e) => setFormData((p) => ({ ...p, minOrder: e.target.value }))}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6" />
                                        <span className="text-xs font-medium">Upload</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </CardContent>
                </Card>

                {/* Tags & Options */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Tags & Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    placeholder="Add a tag..."
                                />
                                <Button type="button" variant="outline" onClick={addTag}>
                                    Add
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-slate-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-slate-700">Featured</span>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Link href="/admin/products">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8"
                    >
                        {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
