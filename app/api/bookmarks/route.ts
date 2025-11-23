import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get all bookmarks for a specific user
export async function GET(req: NextRequest) {
    const database = await db;
    const bookmarkCollection = database?.collection("bookmarks");
    const tweetCollection = database?.collection("tweets");
    
    if (bookmarkCollection && tweetCollection) {
        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get("username");
        
        if (username) {
            const userBookmarks = await bookmarkCollection.find({ bookmarkedBy: username }).toArray();
            const detailedBookmarks = await Promise.all(userBookmarks.map(async (bookmark) => {
                return await tweetCollection.findOne({ _id: bookmark.tweetId });
            }));
            return NextResponse.json(detailedBookmarks);
        }
        return NextResponse.json({ message: "Missing username" }, { status: 400 });
    }
    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

// Toggle bookmark/unbookmark for a tweet
export async function POST(req: NextRequest) {
    const database = await db;
    const bookmarkCollection = database?.collection("bookmarks");
    const tweetCollection = database?.collection("tweets");

    if (bookmarkCollection && tweetCollection) {
        const body = await req.json();
        const { username, tweetId } = body;
        if (!username || !tweetId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId: tweetId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const existingBookmark = await bookmarkCollection.findOne({ bookmarkedBy: username, tweetId: tweetObject._id });
        if (existingBookmark) {
            // If bookmark exists, remove it (unbookmark)
            await bookmarkCollection.deleteOne({ _id: existingBookmark._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.bookmarks": -1 } });
            return NextResponse.json({ message: "Bookmark removed successfully" }, { status: 200 });
        } else {
            // If bookmark doesn't exist, create it
            const newBookmark = {
                tweetId: tweetObject._id,
                bookmarkedBy: username,
                createdAt: new Date(),
            };
            await bookmarkCollection.insertOne(newBookmark);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.bookmarks": 1 } });
            return NextResponse.json({ message: "Bookmark added successfully" }, { status: 201 });
        }
    }
}

