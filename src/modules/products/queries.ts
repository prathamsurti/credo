import { db } from "@/lib/db";

export async function findProducts(filters: {
    search?: string;
    category?: string;
    sort?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    minPrice?: string;
    maxPrice?: string;
}) {
    const {
        search = "",
        category = "",
        sort = "newest",
        featured = false,
        page = 1,
        limit = 12,
        minPrice,
        maxPrice,
    } = filters;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { hasSome: [search.toLowerCase()] } },
        ];
    }
    if (category) {
        where.category = { slug: category };
    }
    if (featured) {
        where.isFeatured = true;
    }
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
        if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
        case "price-asc":
            orderBy = { price: "asc" };
            break;
        case "price-desc":
            orderBy = { price: "desc" };
            break;
        case "name":
            orderBy = { name: "asc" };
            break;
    }

    const [products, total] = await Promise.all([
        db.product.findMany({
            where,
            include: { category: { select: { name: true, slug: true } } },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findProductBySlug(slug: string) {
    const product = await db.product.findUnique({
        where: { slug, isActive: true },
        include: { category: { select: { name: true, slug: true } } },
    });

    if (!product) return null;

    const relatedProducts = await db.product.findMany({
        where: {
            categoryId: product.categoryId,
            isActive: true,
            id: { not: product.id },
        },
        take: 4,
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            images: true,
        },
    });

    return { product, relatedProducts };
}

export async function findAdminProducts(filters: { search?: string; category?: string; page?: number; limit?: number }) {
    const { search = "", category = "", page = 1, limit = 20 } = filters;
    const where: Record<string, unknown> = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    if (category) {
        where.categoryId = category;
    }

    const [products, total] = await Promise.all([
        db.product.findMany({
            where,
            include: { category: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findProductById(id: string) {
    return await db.product.findUnique({
        where: { id },
        include: { category: true },
    });
}
