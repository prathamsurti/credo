import { NextResponse } from "next/server";
import { findProductById } from "@/modules/products/queries";
import { updateProduct, deleteProduct } from "@/modules/products/actions";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await findProductById(id);

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const product = await updateProduct(id, body);

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error updating product:", error);
        if (error?.name === "ZodError") {
            const messages = error.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
            return NextResponse.json({ error: messages || "Invalid product data" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteProduct(id);
        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
