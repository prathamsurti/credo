import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().min(2, "Category name is required"),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
