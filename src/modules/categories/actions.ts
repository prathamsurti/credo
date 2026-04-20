import { db } from "@/lib/db";
import { categorySchema } from "./validations";

export async function createCategory(input: unknown) {
    const data = categorySchema.parse(input);

    const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return await db.category.create({
        data: { ...data, slug },
    });
}

export async function updateCategory(id: string, input: unknown) {
    const data = categorySchema.parse(input);

    const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return await db.category.update({
        where: { id },
        data: { ...data, slug },
    });
}

export async function deleteCategory(id: string) {
    // Check if category has products
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
        throw new Error(`Cannot delete category with ${productCount} products. Move or delete products first.`);
    }

    return await db.category.delete({ where: { id } });
}
