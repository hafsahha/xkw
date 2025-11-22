import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const database = await db;
    const likesCollection = database?.collection("likes");
    const tweetCollection = database?.collection("tweets");

    if (likesCollection && tweetCollection) {
        const body = await req.json();
        const { username, postId } = body;
        if (!username || !postId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId: postId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const existingLike = await likesCollection.findOne({ likedBy: username, tweetId: tweetObject._id });
        if (existingLike) {
            // If like exists, remove it (unlike)
            await likesCollection.deleteOne({ _id: existingLike._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": -1 } });
            return NextResponse.json({ message: "Post unliked successfully" }, { status: 200 });
        } else {
            // If like doesn't exist, create it
            const newLike = {
                tweetId: tweetObject._id,
                likedBy: username,
                createdAt: new Date().toISOString(),
            };
            await likesCollection.insertOne(newLike);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": 1 } });
            return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
        }
    }
}