"use client";

import { useState, useEffect, use } from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/products/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-24 text-slate-400">
                <p className="text-lg font-medium">Product not found</p>
            </div>
        );
    }

    return <ProductForm initialData={product} />;
}
