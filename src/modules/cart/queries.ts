import { db } from "@/lib/db";

export async function getCartItems(userId: string) {
    return await db.cartItem.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    images: true,
                    stock: true,
                    minOrder: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
