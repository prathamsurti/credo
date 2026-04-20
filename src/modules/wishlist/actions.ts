import { db } from "@/lib/db";

export async function addToWishlist(userId: string, productId: string) {
    const existing = await db.wishlistItem.findUnique({
        where: { userId_productId: { userId, productId } },
    });

    if (existing) {
        return { message: "Already in wishlist", item: existing };
    }

    const item = await db.wishlistItem.create({
        data: { userId, productId },
    });

    return { message: "Added to wishlist", item };
}

export async function removeFromWishlist(userId: string, wishlistItemId: string) {
    await db.wishlistItem.delete({
        where: { id: wishlistItemId, userId },
    });
    return { success: true };
}
