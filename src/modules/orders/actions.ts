import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { sendQuotationEmail } from "@/lib/mail";

export async function placeOrder(userId: string, shippingAddress: any, notes?: string) {
    // Get cart items
    const cartItems = await db.cartItem.findMany({
        where: { userId },
        include: { product: true },
    });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (cartItems.length === 0) {
        throw new Error("Cart is empty");
    }

    // Validate stock
    for (const item of cartItems) {
        if (item.quantity > item.product.stock) {
            throw new Error(`${item.product.name} only has ${item.product.stock} units available`);
        }
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    // Create order with items
    const order = await db.order.create({
        data: {
            userId,
            totalAmount,
            shippingAddress,
            notes,
            items: {
                create: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: item.product.price,
                    productName: item.product.name,
                    productImage: item.product.images[0] || null,
                })),
            },
        },
        include: { items: true },
    });

    // Send email
    try {
        await sendQuotationEmail(order, user.email);
    } catch (err) {
        console.error("Failed to send quotation email:", err);
    }

    // Update stock
    for (const item of cartItems) {
        await db.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
        });
    }

    // Clear cart
    await db.cartItem.deleteMany({ where: { userId } });

    return order;
}

export async function updateOrderStatus(id: string, status: string) {
    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    return await db.order.update({
        where: { id },
        data: { status: status as OrderStatus },
    });
}
