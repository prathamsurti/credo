import { db } from "@/lib/db";

export async function findPublicCategories() {
    return await db.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            _count: { select: { products: { where: { isActive: true } } } },
            products: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                }
            }
        },
    });
}

export async function findAllCategories() {
    return await db.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
    });
}
