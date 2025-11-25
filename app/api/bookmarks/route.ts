import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Toggle bookmark/unbookmark for a tweet
export async function POST(req: NextRequest) {
    const database = await db;
    const bookmarkCollection = database?.collection("bookmarks");
    const tweetCollection = database?.collection("tweets");
    const userCollection = database?.collection("users");

    if (bookmarkCollection && tweetCollection) {
        const body = await req.json();
        const { username, tweetId } = body;
        if (!username || !tweetId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const userObject = await userCollection.findOne({ username });
        if (!userObject) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const existingBookmark = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: tweetObject._id });
        if (existingBookmark) {
            // If bookmark exists, remove it (unbookmark)
            await bookmarkCollection.deleteOne({ _id: existingBookmark._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.bookmarks": -1 } });
            return NextResponse.json({ message: "Bookmark removed successfully" }, { status: 200 });
        } else {
            // If bookmark doesn't exist, create it
            const newBookmark = {
                tweetId: tweetObject._id,
                bookmarkedBy: userObject._id,
                createdAt: new Date(),
            };
            await bookmarkCollection.insertOne(newBookmark);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.bookmarks": 1 } });
            return NextResponse.json({ message: "Bookmark added successfully" }, { status: 201 });
        }
    }
}

