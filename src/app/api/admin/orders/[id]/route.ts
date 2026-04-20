import { NextResponse } from "next/server";
import { getOrderById } from "@/modules/orders/queries";
import { updateOrderStatus } from "@/modules/orders/actions";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await getOrderById(id);

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await request.json();
        const order = await updateOrderStatus(id, status);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Error updating order:", error);
        if (error.message === "Invalid status") {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
