import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const database = await db;
    if (!database) {
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    const likesCollection = database?.collection("likes");
    
    if (likesCollection) {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
        const postId = searchParams.get('postId');
        
        try {
            if (username && postId) {
                // Check if specific user liked specific post
                const like = await likesCollection.findOne({ username, postId });
                return NextResponse.json({ 
                    liked: !!like,
                    like: like || null 
                }, { status: 200 });
            } else if (username) {
                // Get all likes by specific user
                const likes = await likesCollection.find({ username }).toArray();
                return NextResponse.json({ 
                    likes,
                    count: likes.length 
                }, { status: 200 });
            } else if (postId) {
                // Get all likes for specific post
                const likes = await likesCollection.find({ postId }).toArray();
                return NextResponse.json({ 
                    likes,
                    count: likes.length 
                }, { status: 200 });
            } else {
                // Get all likes
                const likes = await likesCollection.find({}).toArray();
                return NextResponse.json({ 
                    likes,
                    count: likes.length 
                }, { status: 200 });
            }
        } catch (error) {
            return NextResponse.json({ message: "Error fetching likes", error }, { status: 500 });
        }
    }
    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

export async function POST(req: NextRequest) {
    const database = await db;
    if (!database) {
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    const likesCollection = database?.collection("likes");

    if (likesCollection) {
        const body = await req.json();
        const { username, postId } = body;
        if (!username || !postId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const existingLike = await likesCollection.findOne({ username: username, postId: postId });
        if (existingLike) {
            // If like exists, remove it (unlike)
            await likesCollection.deleteOne({ _id: existingLike._id });
            return NextResponse.json({ message: "Post unliked successfully" }, { status: 200 });
        } else {
            // If like doesn't exist, create it
            const newLike = {
                username: username,
                postId: postId,
                createdAt: new Date().toISOString(),
            };
            await likesCollection.insertOne(newLike);
            return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
        }
    }
}