import { NextResponse } from "next/server";
import { findProducts } from "@/modules/products/queries";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const result = await findProducts({
            search: searchParams.get("search") || "",
            category: searchParams.get("category") || "",
            sort: searchParams.get("sort") || "newest",
            featured: searchParams.get("featured") === "true",
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "12"),
            minPrice: searchParams.get("minPrice") || undefined,
            maxPrice: searchParams.get("maxPrice") || undefined,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
