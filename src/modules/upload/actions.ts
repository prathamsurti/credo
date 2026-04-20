import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function handleFileUpload(file: File) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type");
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error("File too large. Max 5MB.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
}
