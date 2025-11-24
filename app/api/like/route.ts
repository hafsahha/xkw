import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Get tweet likers (users who liked a specific tweet)
export async function GET(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const likeCollection = database?.collection("likes");
    const userCollection = database?.collection("users");

    if (likeCollection && userCollection) {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (id) {
            const tweetObject = await tweetCollection?.findOne({ tweetId: id });
            if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });
            const tweetLikes = await likeCollection.find({ tweetId: tweetObject._id }).toArray();
            const detailedLikes = await Promise.all(tweetLikes.map(async (like) => {
                return await userCollection.findOne({ _id: like.likedBy });
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
    const userCollection = database?.collection("users");

    if (likeCollection && tweetCollection && userCollection) {
        const body = await req.json();
        const { username, tweetId } = body;
        if (!username || !tweetId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const userObject = await userCollection.findOne({ username });
        if (!userObject) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const existingLike = await likeCollection.findOne({ likedBy: userObject._id, tweetId: tweetObject._id });
        if (existingLike) {
            // If like exists, remove it (unlike)
            await likeCollection.deleteOne({ _id: existingLike._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": -1 } });
            return NextResponse.json({ message: "Post unliked successfully" }, { status: 200 });
        } else {
            // If like doesn't exist, create itw
            const newLike = {
                tweetId: tweetObject._id,
                likedBy: userObject._id,
                createdAt: new Date(),
            };
            await likeCollection.insertOne(newLike);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": 1 } });
            return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
        }
    }
}