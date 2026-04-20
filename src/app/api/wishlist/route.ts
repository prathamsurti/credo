import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getWishlistItems } from "@/modules/wishlist/queries";
import { addToWishlist, removeFromWishlist } from "@/modules/wishlist/actions";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await getWishlistItems(session.user.id);
    return NextResponse.json(items);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await request.json();
    const result = await addToWishlist(session.user.id, productId);

    // Status 201 if created, 200 if already exists
    return NextResponse.json(result, { status: result.message === "Already in wishlist" ? 200 : 201 });
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { wishlistItemId } = await request.json();
    await removeFromWishlist(session.user.id, wishlistItemId);
    return NextResponse.json({ message: "Removed from wishlist" });
}
