import { NextResponse } from "next/server";
import { getAdminOrders } from "@/modules/orders/queries";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const result = await getAdminOrders({
            status: searchParams.get("status") || "",
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "20"),
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
