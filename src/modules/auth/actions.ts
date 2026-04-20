import { db } from "@/lib/db";
import { registerSchema } from "./validations";
import bcrypt from "bcryptjs";

export async function registerUser(input: unknown) {
    const validatedData = registerSchema.parse(input);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
    });

    if (existingUser) {
        throw new Error("An account with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await db.user.create({
        data: {
            name: validatedData.name,
            email: validatedData.email,
            passwordHash,
            role: "CUSTOMER",
        },
    });

    return { message: "Account created successfully", userId: user.id };
}
