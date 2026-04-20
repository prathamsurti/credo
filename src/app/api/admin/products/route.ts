import { NextResponse } from "next/server";
import { findAdminProducts } from "@/modules/products/queries";
import { createProduct } from "@/modules/products/actions";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const result = await findAdminProducts({
            search: searchParams.get("search") || "",
            category: searchParams.get("category") || "",
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "20"),
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const product = await createProduct(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error("Error creating product:", error);
        if (error?.name === "ZodError") {
            const messages = error.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
            return NextResponse.json({ error: messages || "Invalid product data" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
