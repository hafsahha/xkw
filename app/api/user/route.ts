import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    const database = await db;
    const usersCollection = database?.collection("users");

    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");
    const limit = searchParams.get("limit");

    if (usersCollection) {
        if (username) {
            const userDoc = await usersCollection.findOne({ username: username });
            if (userDoc) {
                const { _id, password, ...serializedUser } = userDoc;
                return NextResponse.json(serializedUser);
            }
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }
        const allUsers = await usersCollection.find({}).limit(limit ? parseInt(limit) : 100).toArray();
        const serializedUsers = allUsers.map(({ _id, password, ...rest }) => rest);
        return NextResponse.json(serializedUsers);
    }

}