import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const CSV_HEADERS = [
    "name",
    "slug",
    "description",
    "price",
    "compareAtPrice",
    "categoryName",
    "stock",
    "minOrder",
    "tags",
    "images",
] as const;

function escapeCsv(value: string) {
    if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
        return `"${value.replace(/\"/g, '""')}"`;
    }
    return value;
}

export async function GET() {
    try {
        const category = await db.category.findFirst({
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: { name: true },
        });

        const sampleRow = [
            "Classic Canvas Tote",
            "classic-canvas-tote",
            "Durable canvas tote bag for daily essentials",
            "24.99",
            "29.99",
            category?.name ?? "",
            "120",
            "1",
            "bags,canvas,eco",
            "tote-front.jpg,tote-side.jpg",
        ];

        const csv = [
            CSV_HEADERS.join(","),
            sampleRow.map((value) => escapeCsv(value)).join(","),
        ].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=template.csv",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Failed to generate bulk upload template:", error);
        return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
    }
}
