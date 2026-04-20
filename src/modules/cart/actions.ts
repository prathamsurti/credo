import { db } from "@/lib/db";

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
    const existing = await db.cartItem.findUnique({
        where: { userId_productId: { userId, productId } },
    });

    if (existing) {
        return await db.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity },
            include: { product: true },
        });
    }

    return await db.cartItem.create({
        data: { userId, productId, quantity },
        include: { product: true },
    });
}

export async function updateCartQuantity(userId: string, cartItemId: string, quantity: number) {
    if (quantity <= 0) {
        return await removeCartItem(userId, cartItemId);
    }

    return await db.cartItem.update({
        where: { id: cartItemId, userId },
        data: { quantity },
    });
}

export async function removeCartItem(userId: string, cartItemId: string) {
    await db.cartItem.delete({ where: { id: cartItemId, userId } });
    return { success: true };
}

export async function clearCart(userId: string) {
    await db.cartItem.deleteMany({ where: { userId } });
    return { success: true };
}
