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
    const replyRef = searchParams.get("repref");
    const id = searchParams.get("id");

    if (tweetCollection && usersCollection) {
        // Fetch single tweet by ID
        if (id) {
            const tweet = await tweetCollection.findOne({ tweetId: id });
            if (tweet) {
                const author = await usersCollection.findOne({ _id: tweet.author });
                if (author) {
                    const { _id, userId, email, password, stats, createdAt, ...sanitizedAuthor } = author;
                    return NextResponse.json({ ...tweet, author: sanitizedAuthor });
                }
                return NextResponse.json({ ...tweet, author: null });
            }
            return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
        }

        let allTweets;
        if (replyRef) allTweets = await tweetCollection.find({ parentTweetId: replyRef }).toArray(); // Fetch replies to a specific tweet
        else allTweets = await tweetCollection.find({}).toArray(); // Fetch all tweets

        const authorIdMap = new Map<string, ObjectId>();
        for (const t of allTweets) if (t?.author) authorIdMap.set(String(t.author), t.author);
        const authorIds = Array.from(authorIdMap.values());
        const authors = authorIds.length > 0 ? await usersCollection.find({ _id: { $in: authorIds } }).toArray() : [];

        const authorsById = new Map(authors.map(a => [String(a._id), a]));
        const serializedTweets = allTweets.map(({ _id, ...rest }) => {
            const authorObj = authorsById.get(String(rest.author)) || null;
            if (authorObj) {
                const { _id, userId, email, password, stats, createdAt, ...sanitizedAuthor } = authorObj;
                return { ...rest, author: sanitizedAuthor };
            }
            return { ...rest, author: null };
        });
        return NextResponse.json(serializedTweets);
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

        const authorObjectId = await usersCollection.findOne({ userId: authorId }).then(user => user?._id);
        const newTweet = {
            author: authorObjectId,
            content,
            media: media || [],
            parentTweetId: tweetRef || null,
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