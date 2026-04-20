import { NextResponse } from "next/server";
import { handleFileUpload } from "@/modules/upload/actions";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const url = await handleFileUpload(file);

        return NextResponse.json({ url }, { status: 201 });
    } catch (error: any) {
        console.error("Upload error:", error);
        if (error.message.includes("Invalid file type") || error.message.includes("File too large")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
