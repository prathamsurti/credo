import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserOrders } from "@/modules/orders/queries";
import { placeOrder } from "@/modules/orders/actions";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await getUserOrders(session.user.id);
    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { shippingAddress, notes } = await request.json();
        const order = await placeOrder(session.user.id, shippingAddress, notes);
        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        if (error.message.includes("available") || error.message === "Cart is empty") {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Order creation error:", error);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}
