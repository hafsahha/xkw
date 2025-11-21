import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import db from "@/lib/db";
import { createHmac } from "crypto";

// Fetch tweets (single or all)
export async function GET(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const usersCollection = database?.collection("users");

    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");
    const id = searchParams.get("id");

    if (tweetCollection && usersCollection) {
        // Fetch single tweet by ID
        if (id) {
            const tweet = await tweetCollection.findOne({ tweetId: id });
            if (tweet) {
                // Fetch replies
                const replies = await tweetCollection.find({ parentTweetId: tweet._id }).toArray();
                return NextResponse.json({ ...tweet, replies });
            }
            return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
        }

        // Fetch tweets by username
        if (username) {
            const userTweets = await tweetCollection.find({ "author.username": username }).sort({ createdAt: -1 }).toArray();
            return NextResponse.json(userTweets);
        }
        
        // Fetch all tweets
        const allTweets = await tweetCollection.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(allTweets);
    }
    return NextResponse.json({ message: "No tweets found" }, { status: 404 });
}

// Create a new tweet
export async function POST(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const usersCollection = database?.collection("users");

    if (tweetCollection && usersCollection) {
        const body = await req.json();
        const { authorId, content, media, tweetRef, type } = body;
        if (!authorId || !content) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const authorObject = await usersCollection.findOne({ userId: authorId });
        const refObject = tweetRef ? await tweetCollection.findOne({ tweetId: tweetRef }) : null;
        const newTweet = {
            author: {
                userId: authorObject?.userId,
                name: authorObject?.name,
                username: authorObject?.username,
                avatar: authorObject?.media.profileImage
            },
            content,
            media: media || [],
            parentTweetId: refObject?._id,
            type: type || "Original",
            stats: { replies: 0, retweets: 0, quotes: 0, likes: 0 },
            createdAt: new Date().toISOString()
        };
        const result = await tweetCollection.insertOne(newTweet);

        const id = String(result.insertedId);
        const secret = process.env.TWEET_SECRET || "default_secret";
        const raw = createHmac("sha256", secret).update(id).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const tweetId = raw.slice(0, 24);
        await tweetCollection.updateOne({ _id: result.insertedId }, { $set: { tweetId: tweetId } });
        return NextResponse.json({ message: "Tweet created", tweetId }, { status: 201 });
    }
    return NextResponse.json({ message: "Failed to create tweet" }, { status: 500 });
}