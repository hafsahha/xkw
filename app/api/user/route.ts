import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        const usersCollection = database.collection("users");

        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get("username");
        const limit = searchParams.get("limit");

        if (username) {
            const userDoc = await usersCollection.findOne({ username: username });
            if (userDoc) {
                const { _id, password, ...serializedUser } = userDoc;
                return NextResponse.json(serializedUser);
            }
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        const allUsers = await usersCollection.find({}).limit(limit ? parseInt(limit) : 100).toArray();
        const serializedUsers = allUsers.map(({ _id, password, ...rest }) => rest);
        return NextResponse.json(serializedUsers);
        
    } catch (error) {
        console.error("Error in GET /api/user:", error);
        return NextResponse.json({ 
            error: "Database connection failed", 
            details: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}