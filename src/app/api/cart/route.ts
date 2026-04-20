import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getCartItems } from "@/modules/cart/queries";
import { addToCart, updateCartQuantity, removeCartItem } from "@/modules/cart/actions";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await getCartItems(session.user.id);
    return NextResponse.json(items);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity = 1 } = await request.json();
    const item = await addToCart(session.user.id, productId, quantity);
    return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId, quantity } = await request.json();
    const result = await updateCartQuantity(session.user.id, cartItemId, quantity);
    return NextResponse.json(result);
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId } = await request.json();
    await removeCartItem(session.user.id, cartItemId);
    return NextResponse.json({ message: "Item removed" });
}
