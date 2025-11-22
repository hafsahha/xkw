import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import db from "@/lib/db";

// Get tweet retweeters (users who retweeted a specific tweet, excluding quotes)
export async function GET(req: NextRequest) {
    const database = await db;
    const retweetCollection = database?.collection("retweets");
    const userCollection = database?.collection("users");

    if (retweetCollection && userCollection) {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (id) {
            const tweetRetweets = await retweetCollection.find({ tweetId: new ObjectId(id) }).toArray();
            const detailedRetweets = await Promise.all(tweetRetweets.map(async (retweet) => {
                return await userCollection.findOne({ username: retweet.retweetedBy });
            }));
            return NextResponse.json(detailedRetweets);
        }
        return NextResponse.json({ message: "Missing tweet ID" }, { status: 400 });
    }
    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

// Toggle retweet/unretweet for a tweet
export async function POST(req: NextRequest) {
    const database = await db;
    const retweetsCollection = database?.collection("retweets");
    const tweetCollection = database?.collection("tweets");

    if (retweetsCollection && tweetCollection) {
        const body = await req.json();
        const { username, postId } = body;
        if (!username || !postId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId: postId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const existingRetweet = await retweetsCollection.findOne({ retweetedBy: username, tweetId: tweetObject._id });
        if (existingRetweet) {
            // If retweet exists, remove it (unretweet)
            await retweetsCollection.deleteOne({ _id: existingRetweet._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.retweets": -1 } });
            return NextResponse.json({ message: "Retweet removed successfully" }, { status: 200 });
        } else {
            // If retweet doesn't exist, create it
            const newRetweet = {
                tweetId: tweetObject._id,
                retweetedBy: username,
                createdAt: new Date().toISOString(),
            };
            await retweetsCollection.insertOne(newRetweet);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.retweets": 1 } });
            return NextResponse.json({ message: "Retweet added successfully" }, { status: 201 });
        }
    }
}