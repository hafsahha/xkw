import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const database = await db;
    const likesCollection = database?.collection("likes");

    if (likesCollection) {
        const body = await req.json();
        const { username, postId } = body;
        if (!username || !postId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const existingLike = await likesCollection.findOne({ username: username, postId: postId });
        if (existingLike) {
            // If like exists, remove it (unlike)
            await likesCollection.deleteOne({ _id: existingLike._id });
            return NextResponse.json({ message: "Post unliked successfully" }, { status: 200 });
        } else {
            // If like doesn't exist, create it
            const newLike = {
                username: username,
                postId: postId,
                createdAt: new Date().toISOString(),
            };
            await likesCollection.insertOne(newLike);
            return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
        }
    }
}