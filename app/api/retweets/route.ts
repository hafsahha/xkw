import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const database = await db;
    if (!database) {
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    const retweetsCollection = database?.collection("retweets");
    
    if (retweetsCollection) {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
        const postId = searchParams.get('postId');
        
        try {
            if (username && postId) {
                // Check if specific user retweeted specific post
                const retweet = await retweetsCollection.findOne({ username, postId });
                return NextResponse.json({ 
                    retweeted: !!retweet,
                    retweet: retweet || null 
                }, { status: 200 });
            } else if (username) {
                // Get all retweets by specific user
                const retweets = await retweetsCollection.find({ username }).toArray();
                return NextResponse.json({ 
                    retweets,
                    count: retweets.length 
                }, { status: 200 });
            } else if (postId) {
                // Get all retweets for specific post
                const retweets = await retweetsCollection.find({ postId }).toArray();
                return NextResponse.json({ 
                    retweets,
                    count: retweets.length 
                }, { status: 200 });
            } else {
                // Get all retweets
                const retweets = await retweetsCollection.find({}).toArray();
                return NextResponse.json({ 
                    retweets,
                    count: retweets.length 
                }, { status: 200 });
            }
        } catch (error) {
            return NextResponse.json({ message: "Error fetching retweets", error }, { status: 500 });
        }
    }
    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

export async function POST(req: NextRequest) {
    const database = await db;
    if (!database) {
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    const retweetsCollection = database?.collection("retweets");

    if (retweetsCollection) {
        const body = await req.json();
        const { username, postId } = body;
        if (!username || !postId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const existingRetweet = await retweetsCollection.findOne({ username: username, postId: postId });
        if (existingRetweet) {
            // If retweet exists, remove it (unretweet)
            await retweetsCollection.deleteOne({ _id: existingRetweet._id });
            return NextResponse.json({ message: "Retweet removed successfully" }, { status: 200 });
        } else {
            // If retweet doesn't exist, create it
            const newRetweet = {
                username: username,
                postId: postId,
                createdAt: new Date().toISOString(),
            };
            await retweetsCollection.insertOne(newRetweet);
            return NextResponse.json({ message: "Retweet added successfully" }, { status: 201 });
        }
    }
}