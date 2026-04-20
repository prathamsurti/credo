import { db } from "@/lib/db";

export async function getUserOrders(userId: string) {
    return await db.order.findMany({
        where: { userId },
        include: {
            items: {
                include: { product: { select: { name: true, images: true, slug: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getAdminOrders(filters: { status?: string; page?: number; limit?: number }) {
    const { status = "", page = 1, limit = 20 } = filters;

    const where: Record<string, unknown> = {};
    if (status) {
        where.status = status;
    }

    const [orders, total] = await Promise.all([
        db.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: { select: { name: true, images: true } } } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.order.count({ where }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getOrderById(id: string) {
    return await db.order.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, email: true, phone: true } },
            items: {
                include: { product: { select: { name: true, images: true, slug: true } } },
            },
        },
    });
}
