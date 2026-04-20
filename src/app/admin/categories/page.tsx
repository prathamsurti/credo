"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, FolderOpen, Image as ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    _count: { products: number };
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({ name: "", description: "", image: "", isActive: true });
    const [error, setError] = useState("");

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const openCreateDialog = () => {
        setEditCategory(null);
        setFormData({ name: "", description: "", image: "", isActive: true });
        setError("");
        setDialogOpen(true);
    };

    const openEditDialog = (cat: Category) => {
        setEditCategory(cat);
        setFormData({ name: cat.name, description: cat.description || "", image: cat.image || "", isActive: cat.isActive });
        setError("");
        setDialogOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError("");

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

            setFormData((prev) => ({ ...prev, image: data.url }));
        } catch (err: any) {
            setError(err.message || "Failed to upload image");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError("Category name is required");
            return;
        }
        setSaving(true);
        setError("");

        try {
            const url = editCategory
                ? `/api/admin/categories/${editCategory.id}`
                : "/api/admin/categories";
            const method = editCategory ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to save category");
                return;
            }

            setDialogOpen(false);
            fetchCategories();
        } catch {
            setError("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete");
                return;
            }
            setDeleteId(null);
            fetchCategories();
        } catch {
            alert("Failed to delete category");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Categories</h1>
                    <p className="text-slate-400 mt-1">Organize your products into categories</p>
                </div>
                <Button
                    onClick={openCreateDialog}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-200/50"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <Card className="border border-slate-800 shadow-sm bg-slate-900">
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No categories yet</p>
                            <p className="text-sm">Create your first category to organize products.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="border border-slate-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-slate-800/50"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center overflow-hidden border border-amber-500/30">
                                            {cat.image ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FolderOpen className="w-5 h-5 text-amber-400" />
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-amber-400 h-8 w-8 p-0" onClick={() => openEditDialog(cat)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 h-8 w-8 p-0" onClick={() => setDeleteId(cat.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-white">{cat.name}</h3>
                                    {cat.description && (
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-slate-400">{cat._count.products} products</span>
                                        <Badge className={`border text-xs ${
                                            cat.isActive 
                                                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                                : "bg-slate-700 text-slate-400 border-slate-600"
                                        }`}>
                                            {cat.isActive ? "Active" : "Hidden"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editCategory ? "Edit Category" : "New Category"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Premium Hampers"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                            <div className="flex items-center gap-4">
                                {formData.image ? (
                                    <div className="relative w-20 h-20 border rounded overflow-hidden group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-white hover:text-red-400 p-0 h-6 w-6"
                                                onClick={() => setFormData(p => ({ ...p, image: "" }))}
                                                type="button"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                        {uploadingImage ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 mb-1" />
                                        )}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Upload a square image (e.g. 500x500px).
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Optional description"
                                rows={3}
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-700">Active</span>
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                        >
                            {saving ? "Saving..." : editCategory ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure? Categories with products cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
