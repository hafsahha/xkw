import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const bookmarksCollection = database.collection("bookmarks");
        const userCollection = database.collection("users");
        const tweetCollection = database.collection("tweets");

        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get("username");
        const userId = searchParams.get("userId");

        if (username || userId) {
            let user;
            if (userId) {
                user = { _id: new ObjectId(userId) };
            } else {
                user = await userCollection.findOne({ username });
                if (!user) {
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }
            }
            
            const bookmarks = await bookmarksCollection
                .find({ userId: user._id })
                .sort({ createdAt: -1 })
                .toArray();
                
            // Get tweet details for bookmarks
            const bookmarksWithTweets = await Promise.all(
                bookmarks.map(async (bookmark) => {
                    const tweet = await tweetCollection.findOne({ _id: bookmark.tweetId });
                    return { ...bookmark, tweet };
                })
            );
            
            return NextResponse.json({ 
                bookmarks: bookmarksWithTweets,
                count: bookmarks.length 
            });
        }
        
        // Get all bookmarks
        const allBookmarks = await bookmarksCollection.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ bookmarks: allBookmarks, count: allBookmarks.length });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching bookmarks", details: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const bookmarksCollection = database.collection("bookmarks");
        const tweetCollection = database.collection("tweets");
        const userCollection = database.collection("users");

        const body = await req.json();
        const { username, tweetId, postId } = body;
        
        // Support both tweetId and postId for compatibility
        const finalTweetId = tweetId || postId;
        
        if (!username || !finalTweetId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [user, tweet] = await Promise.all([
            userCollection.findOne({ username }),
            tweetCollection.findOne({ tweetId: finalTweetId })
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        if (!tweet) {
            return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
        }

        // Check if user already bookmarked this tweet
        const existingBookmark = await bookmarksCollection.findOne({ 
            userId: user._id, 
            tweetId: tweet._id 
        });
        
        if (existingBookmark) {
            // Un-bookmark
            await bookmarksCollection.deleteOne({ _id: existingBookmark._id });
            
            return NextResponse.json({ 
                message: "Tweet un-bookmarked successfully", 
                isBookmarked: false 
            }, { status: 200 });
        } else {
            // Bookmark
            const newBookmark = {
                userId: user._id,
                tweetId: tweet._id,
                createdAt: new Date()
            };
            
            await bookmarksCollection.insertOne(newBookmark);
            
            return NextResponse.json({ 
                message: "Tweet bookmarked successfully", 
                isBookmarked: true 
            }, { status: 201 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error processing bookmark", details: error }, { status: 500 });
    }
}