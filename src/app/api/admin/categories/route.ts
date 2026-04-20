import { NextResponse } from "next/server";
import { findAllCategories } from "@/modules/categories/queries";
import { createCategory } from "@/modules/categories/actions";

export async function GET() {
    try {
        const categories = await findAllCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const category = await createCategory(body);
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error("Error creating category:", error);
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
