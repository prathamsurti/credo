import { db } from "@/lib/db";

export async function getWishlistItems(userId: string) {
    return await db.wishlistItem.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    compareAtPrice: true,
                    images: true,
                    stock: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
