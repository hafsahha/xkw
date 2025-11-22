import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const database = await db;
    if (!database) {
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    const bookmarksCollection = database?.collection("bookmarks");
    
    if (bookmarksCollection) {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
        const postId = searchParams.get('postId');
        
        try {
            if (username && postId) {
                // Check if specific user bookmarked specific post
                const bookmark = await bookmarksCollection.findOne({ bookmarkedBy: username, postId: postId });
                return NextResponse.json({ 
                    bookmarked: !!bookmark,
                    bookmark: bookmark || null 
                }, { status: 200 });
            } else if (username) {
                // Get all bookmarks by specific user
                const bookmarks = await bookmarksCollection.find({ bookmarkedBy: username }).toArray();
                return NextResponse.json({ 
                    bookmarks,
                    count: bookmarks.length 
                }, { status: 200 });
            } else if (postId) {
                // Get all bookmarks for specific post
                const bookmarks = await bookmarksCollection.find({ postId: postId }).toArray();
                return NextResponse.json({ 
                    bookmarks,
                    count: bookmarks.length 
                }, { status: 200 });
            } else {
                // Get all bookmarks
                const bookmarks = await bookmarksCollection.find({}).toArray();
                return NextResponse.json({ 
                    bookmarks,
                    count: bookmarks.length 
                }, { status: 200 });
            }
        } catch (error) {
            return NextResponse.json({ message: "Error fetching bookmarks", error }, { status: 500 });
        }
    }
    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

export async function POST(req: NextRequest) {
    const database = await db;
    if (!database) {
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    const bookmarksCollection = database?.collection("bookmarks");
    const tweetCollection = database?.collection("tweets");

    if (bookmarksCollection && tweetCollection) {
        const body = await req.json();
        const { username, postId } = body;
        if (!username || !postId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId: postId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const existingBookmark = await bookmarksCollection.findOne({ bookmarkedBy: username, tweetId: tweetObject._id });
        if (existingBookmark) {
            // If bookmark exists, remove it (unbookmark)
            await bookmarksCollection.deleteOne({ _id: existingBookmark._id });
            return NextResponse.json({ message: "Bookmark removed successfully" }, { status: 200 });
        } else {
            // If bookmark doesn't exist, create it
            const newBookmark = {
                tweetId: tweetObject._id,
                bookmarkedBy: username,
                createdAt: new Date().toISOString(),
            };
            await bookmarksCollection.insertOne(newBookmark);
            return NextResponse.json({ message: "Bookmark added successfully" }, { status: 201 });
        }
    }
}