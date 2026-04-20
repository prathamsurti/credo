import { db } from "@/lib/db";
import { z } from "zod";
import { productSchema } from "./validations";

export async function createProduct(input: unknown) {
    const data = productSchema.parse(input);

    const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = await db.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return await db.product.create({
        data: { ...data, slug: finalSlug },
        include: { category: { select: { name: true } } },
    });
}

export async function updateProduct(id: string, input: unknown) {
    // Allow partial updates by only validating provided fields
    const data = z.object({
        name: z.string().min(2).optional(),
        description: z.string().min(10).optional(),
        price: z.number().positive().optional(),
        compareAtPrice: z.number().positive().optional().nullable(),
        categoryId: z.string().min(1).optional(),
        stock: z.number().int().min(0).optional(),
        minOrder: z.number().int().min(1).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
    }).parse(input);

    return await db.product.update({
        where: { id },
        data,
        include: { category: { select: { name: true } } },
    });
}

export async function deleteProduct(id: string) {
    return await db.product.delete({ where: { id } });
}
