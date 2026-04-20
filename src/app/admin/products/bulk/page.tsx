"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { read, utils } from "xlsx";
import { Upload, FileSpreadsheet, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ProductRow {
    name: string;
    slug?: string;
    description: string;
    price: string | number;
    compareAtPrice?: string | number;
    categoryName: string;
    stock?: string | number;
    minOrder?: string | number;
    tags?: string;
    images?: string;
}

const REQUIRED_HEADERS = ["name", "description", "price", "categoryName"];

const normalizeHeader = (header: string) => header.trim().toLowerCase();

export default function BulkUploadPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [parsedData, setParsedData] = useState<ProductRow[]>([]);
    
    // UI Helpers
    const handleSpreadsheetDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === "text/csv" || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            setSpreadsheetFile(file);
            parseSpreadsheet(file);
        } else {
            toast.error("Invalid file format. Please upload a .csv or .xlsx file.");
        }
    };

    const handleImagesDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validImages = files.filter(f => f.type.startsWith("image/"));
        setImageFiles(prev => [...prev, ...validImages]);
    };

    const removeImage = (name: string) => {
        setImageFiles(prev => prev.filter(f => f.name !== name));
    };

    const parseSpreadsheet = async (file: File) => {
        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: "" });

            if (rows.length === 0) {
                throw new Error("Spreadsheet is empty.");
            }

            const firstRow = Array.isArray(rows[0]) ? rows[0] : [];
            const rawHeaders = firstRow.map((cell) => String(cell));
            const normalizedHeaders = rawHeaders.map(normalizeHeader);
            const missingHeaders = REQUIRED_HEADERS.filter((header) => !normalizedHeaders.includes(normalizeHeader(header)));

            if (missingHeaders.length > 0) {
                throw new Error(`Missing required header(s): ${missingHeaders.join(", ")}`);
            }
            
            // Map the parsed data to normalized keys so missing fields aren't false-positives
            type RawRow = Record<string, unknown>;
            const rawJson = utils.sheet_to_json<RawRow>(worksheet, { defval: "" });
            if (rawJson.length === 0) {
                throw new Error("No data rows found under the headers.");
            }

            const json: ProductRow[] = rawJson.map((row) => {
                const normalizedRow: Record<string, unknown> = {};
                for (const key in row) {
                    // Match key back to REQUIRED_HEADERS if possible
                    const lowerKey = normalizeHeader(key);
                    const originalHeader = REQUIRED_HEADERS.find((h) => normalizeHeader(h) === lowerKey) || lowerKey;
                    normalizedRow[originalHeader as string] = row[key];
                }
                return normalizedRow as unknown as ProductRow;
            });

            setParsedData(json);
            toast.success(`Parsed ${json.length} rows successfully.`);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to parse spreadsheet.");
            setSpreadsheetFile(null);
        }
    };

    const uploadImageToCDN = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");
        
        const data = await res.json();
        return data.url as string;
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    };

    const processUpload = async () => {
        if (parsedData.length === 0) {
            toast.error("No valid data found in spreadsheet.");
            return;
        }

        setIsLoading(true);
        const processingToast = toast.loading("Processing upload...");

        try {
            const validProducts = [];

            for (const [index, row] of parsedData.entries()) {
                if (!row.name || !row.description || !row.price || !row.categoryName) {
                    throw new Error(`Row ${index + 1}: Missing required fields (name, description, price, categoryName).`);
                }

                // Parse image references (e.g., "shoe.jpg, back.jpg" or "https://example.com/img.jpg")
                const parsedImagePaths: string[] = [];
                if (row.images) {
                    const imageNames = String(row.images).split(",").map(i => i.trim());
                    
                    for (const imgName of imageNames) {
                        // Is it already a URL?
                        if (imgName.startsWith("http") || imgName.startsWith("https") || imgName.startsWith("www.") || imgName.startsWith("//") || imgName.startsWith("/uploads/")) {
                            // Normalize www. or // links to absolute https URLs if missing protocol
                            let finalUrl = imgName;
                            if (imgName.startsWith("www.")) finalUrl = `https://${imgName}`;
                            else if (imgName.startsWith("//")) finalUrl = `https:${imgName}`;
                            
                            parsedImagePaths.push(finalUrl);
                            continue;
                        }

                        // Try to find matching dropped file
                        const matchedFile = imageFiles.find(f => f.name === imgName);
                        if (matchedFile) {
                            try {
                                const cdnUrl = await uploadImageToCDN(matchedFile);
                                parsedImagePaths.push(cdnUrl);
                            } catch {
                                console.warn(`Failed to upload ${imgName}`);
                            }
                        } else {
                            toast.warning(`Warning: Image file "${imgName}" referenced but not uploaded. Skipping image.`);
                        }
                    }
                }

                // Construct final payload object
                validProducts.push({
                    name: String(row.name),
                    slug: row.slug ? String(row.slug) : generateSlug(String(row.name)),
                    description: String(row.description),
                    price: Number(row.price),
                    compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : undefined,
                    categoryName: String(row.categoryName).trim(),
                    stock: row.stock ? Number(row.stock) : 0,
                    minOrder: row.minOrder ? Number(row.minOrder) : 1,
                    tags: row.tags ? String(row.tags).split(",").map(t => t.trim()) : [],
                    images: parsedImagePaths,
                    isActive: true,
                    isFeatured: false,
                });
            }

            // Send payload to API
            const res = await fetch("/api/admin/products/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ products: validProducts }),
            });

            let data: { message?: string; error?: string; details?: unknown } = {};
            try {
                data = await res.json();
            } catch (e) {
                throw new Error(`Server returned a non-JSON response. Status: ${res.status}`);
            }

            if (res.ok) {
                toast.success("Uploaded successfully", { id: processingToast });
                // Add a small delay so the user can see the success message
                setTimeout(() => {
                    router.push("/admin/products");
                    router.refresh();
                }, 1000);
            } else {
                let errorMessage = data.error || "Batch insertion failed.";
                if (data.details && typeof data.details === 'object') {
                    // if it's a validation error or missing categories, stringify it
                    errorMessage += " " + JSON.stringify(data.details);
                }
                toast.error(errorMessage, { id: processingToast, duration: 8000 });
                console.error("Batch failure details:", data.details);
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred during processing.";
            toast.error(message, { id: processingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl tracking-tight font-black uppercase text-foreground mb-8">Bulk Upload Products</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* Step 1: Spreadsheet */}
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                        <h2 className="text-lg font-bold uppercase">Spreadsheet</h2>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">
                        Upload your `.csv` or `.xlsx` mapping file. Required columns: `name`, `description`, `price`, `categoryName`. Optional: `slug`, `compareAtPrice`, `stock`, `minOrder`, `tags`, `images`.
                    </p>

                    <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                        Embedded images inside `.xlsx` files are not supported. Use the `images` column with either public URLs or image filenames (for example `shoe.jpg`) and upload those files in step 2.
                    </div>

                    <a
                        href="/api/admin/products/template"
                        download
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline mb-6"
                    >
                        Download template (CSV)
                    </a>

                    <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${spreadsheetFile ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/50"}`}>
                        <Input 
                            type="file" 
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            className="hidden"
                            id="spreadsheet-upload"
                            onChange={handleSpreadsheetDrop}
                        />
                        <label htmlFor="spreadsheet-upload" className="cursor-pointer flex flex-col items-center w-full">
                            {spreadsheetFile ? (
                                <>
                                    <FileSpreadsheet className="w-10 h-10 text-green-500 mb-3" />
                                    <p className="font-semibold text-foreground text-sm truncate max-w-[200px]">{spreadsheetFile.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{parsedData.length} rows parsed</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                                    <p className="font-semibold text-foreground text-sm">Click to upload spreadsheet</p>
                                    <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS up to 10MB</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {/* Step 2: Images */}
                <div className="glass-panel p-6 rounded-2xl border border-border relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                        <h2 className="text-lg font-bold uppercase">Associated Images</h2>
                    </div>

                     <p className="text-sm text-muted-foreground mb-6">
                                If your spreadsheet references image filenames (e.g. `shoe.jpg`) in the `images` column, upload those files here. We map by exact filename.
                    </p>

                    <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors mb-4">
                        <Input 
                            type="file" 
                            accept="image/*"
                            multiple
                            className="hidden"
                            id="image-multi-upload"
                            onChange={handleImagesDrop}
                        />
                        <label htmlFor="image-multi-upload" className="cursor-pointer flex flex-col items-center w-full">
                             <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
                             <p className="font-semibold text-foreground text-sm">Click to bulk upload images</p>
                             <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB each</p>
                        </label>
                    </div>

                    {imageFiles.length > 0 && (
                        <div className="max-h-32 overflow-y-auto pr-2 space-y-2">
                             {imageFiles.map((file, i) => (
                                 <div key={i} className="flex items-center justify-between bg-secondary/50 p-2 rounded-lg text-xs">
                                     <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                                     <button onClick={() => removeImage(file.name)} className="text-muted-foreground hover:text-destructive">
                                         <X className="w-4 h-4" />
                                     </button>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>

            </div>

             {/* Action Bar */}
             <div className="flex justify-end pt-6 border-t border-border">
                <Button 
                    size="lg" 
                    onClick={processUpload} 
                    disabled={!spreadsheetFile || parsedData.length === 0 || isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Processing Upload...
                        </>
                    ) : (
                        "Import Products"
                    )}
                </Button>
            </div>

        </div>
    );
}
