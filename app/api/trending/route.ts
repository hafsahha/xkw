import { NextRequest, NextResponse } from 'next/server';
import db from "@/lib/db";
import { ObjectId } from "mongodb";

//  Get trending_hashtags collections
export async function GET(req: NextRequest) {
    const database = await db;
    const trendingHashtagCollection = database?.collection("trending_hashtags");
    const trendingPostsCollection = database?.collection("trending_posts");

    if (trendingHashtagCollection && trendingPostsCollection) {
        const trendingHashtags = await trendingHashtagCollection.find().sort({ count: -1 }).toArray();
        if (!Array.isArray(trendingHashtags) || trendingHashtags.length === 0) {
            const defaultHashtags = [
            { _id: new ObjectId(), tag: "#WebDevelopment", count: 1, createdAt: new Date() },
            { _id: new ObjectId(), tag: "#NextJS", count: 1, createdAt: new Date() },
            { _id: new ObjectId(), tag: "#MongoDb", count: 1, createdAt: new Date() },
            { _id: new ObjectId(), tag: "#React", count: 1, createdAt: new Date() },
            { _id: new ObjectId(), tag: "#JavaScript", count: 1, createdAt: new Date() }
            ];

            // populate the returned array so the view can display defaults (no DB writes)
            if (Array.isArray(trendingHashtags)) {
                trendingHashtags.push(...defaultHashtags);
            }
        }
        
        const trendingPosts = await trendingPostsCollection.find().sort({ interactions: -1 }).toArray();

        return NextResponse.json({ hashtags: trendingHashtags, posts: trendingPosts });
    }

    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}