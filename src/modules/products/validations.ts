import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(2, "Product name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    compareAtPrice: z.number().positive().optional().nullable(),
    categoryId: z.string().min(1, "Category is required"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    minOrder: z.number().int().min(1).default(1),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    bannerImage: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
