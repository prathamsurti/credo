import { NextResponse } from "next/server";
import { registerUser } from "@/modules/auth/actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await registerUser(body);

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        if (error?.name === "ZodError") {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }
        if (error.message === "An account with this email already exists") {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
