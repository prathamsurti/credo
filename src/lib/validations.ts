import { z } from "zod";

export const addressSchema = z.object({
    label: z.string().default("Home"),
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().min(10, "Valid phone number required"),
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().default("India"),
    isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
