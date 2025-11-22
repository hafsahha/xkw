import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import db from "@/lib/db";

// Get tweet likers (users who liked a specific tweet)
export async function GET(req: NextRequest) {
    const database = await db;
    const likeCollection = database?.collection("likes");
    const userCollection = database?.collection("users");

    if (likeCollection && userCollection) {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (id) {
            const tweetLikes = await likeCollection.find({ tweetId: new ObjectId(id) }).toArray();
            const detailedLikes = await Promise.all(tweetLikes.map(async (like) => {
                return await userCollection.findOne({ username: like.likedBy });
            }));
            return NextResponse.json(detailedLikes);
        }
        return NextResponse.json({ message: "Missing tweet ID" }, { status: 400 });
    }
    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

// Toggle like/unlike for a tweet
export async function POST(req: NextRequest) {
    const database = await db;
    const likeCollection = database?.collection("likes");
    const tweetCollection = database?.collection("tweets");

    if (likeCollection && tweetCollection) {
        const body = await req.json();
        const { username, tweetId } = body;
        if (!username || !tweetId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId: tweetId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const existingLike = await likeCollection.findOne({ likedBy: username, tweetId: tweetObject._id });
        if (existingLike) {
            // If like exists, remove it (unlike)
            await likeCollection.deleteOne({ _id: existingLike._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": -1 } });
            return NextResponse.json({ message: "Post unliked successfully" }, { status: 200 });
        } else {
            // If like doesn't exist, create it
            const newLike = {
                tweetId: tweetObject._id,
                likedBy: username,
                createdAt: new Date().toISOString(),
            };
            await likeCollection.insertOne(newLike);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": 1 } });
            return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
        }
    }
}