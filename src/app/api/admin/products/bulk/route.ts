import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const bulkProductSchema = z.array(
    z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().min(10),
        price: z.number().min(0),
        compareAtPrice: z.number().optional().nullable(),
        categoryName: z.string().min(1),
        stock: z.number().int().min(0).default(0),
        minOrder: z.number().int().min(1).default(1),
        tags: z.array(z.string()).default([]),
        images: z.array(z.string()).default([]),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
    })
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedProducts = bulkProductSchema.parse(body.products);

        const categories = await db.category.findMany({
            select: { id: true, name: true },
        });

        const categoryMap = new Map(
            categories.map((category) => [category.name.trim().toLowerCase(), category.id])
        );

        const unresolvedCategories: string[] = [];
        const productsWithCategoryId = validatedProducts.map((product) => {
            const normalizedCategoryName = product.categoryName.trim().toLowerCase();
            const categoryId = categoryMap.get(normalizedCategoryName);

            if (!categoryId) {
                unresolvedCategories.push(product.categoryName);
            }

            return {
                ...product,
                categoryId,
            };
        });

        if (unresolvedCategories.length > 0) {
            const uniqueMissing = Array.from(new Set(unresolvedCategories));
            return NextResponse.json(
                {
                    error: "Unknown category names in upload",
                    details: {
                        missingCategoryNames: uniqueMissing,
                    },
                },
                { status: 400 }
            );
        }

        const insertData = productsWithCategoryId.map((product) => ({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            categoryId: product.categoryId as string,
            stock: product.stock,
            minOrder: product.minOrder,
            tags: product.tags,
            images: product.images,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
        }));

        // Perform bulk creation via a transaction since `createMany` does not return the created records natively in a way that handles all relations easily without jumping through hoops if needed. However, since Prisma 5+ supports returning created from createMany, we'll try that if possible or map out sequential ones for category safety.
        // Actually, createMany is perfectly fine here.

        const result = await db.product.createMany({
            data: insertData,
            skipDuplicates: true // Skip on unique constraint (slug) failures to prevent whole batch failure
        });

        return NextResponse.json(
            { success: true, count: result.count, message: `Successfully created ${result.count} products.` },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation Error", details: error.flatten().fieldErrors }, { status: 400 });
        }
        
        console.error("Bulk upload route error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
