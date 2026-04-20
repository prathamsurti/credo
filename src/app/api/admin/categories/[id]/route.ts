import { NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/modules/categories/actions";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const category = await updateCategory(id, body);

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteCategory(id);
        return NextResponse.json({ message: "Category deleted" });
    } catch (error: any) {
        if (error.message.includes("Cannot delete category")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
