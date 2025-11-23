import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const type = searchParams.get('type'); // 'tweets', 'users', 'hashtags', 'all'
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        
        if (!query) {
            return NextResponse.json({ error: "Search query is required" }, { status: 400 });
        }
        
        const skip = (page - 1) * limit;
        const searchRegex = new RegExp(query, 'i');
        
        let results: any = {};
        
        if (type === 'tweets' || type === 'all') {
            const tweetsCollection = database.collection("tweets");
            const tweets = await tweetsCollection
                .find({
                    $or: [
                        { content: searchRegex },
                        { "author.name": searchRegex },
                        { "author.username": searchRegex },
                        { hashtags: { $in: [query.toLowerCase()] } }
                    ]
                })
                .sort({ createdAt: -1 })
                .skip(type === 'all' ? 0 : skip)
                .limit(type === 'all' ? 10 : limit)
                .toArray();
                
            results.tweets = tweets;
        }
        
        if (type === 'users' || type === 'all') {
            const usersCollection = database.collection("users");
            const users = await usersCollection
                .find({
                    $or: [
                        { name: searchRegex },
                        { username: searchRegex },
                        { bio: searchRegex }
                    ]
                }, {
                    projection: { password: 0 }
                })
                .skip(type === 'all' ? 0 : skip)
                .limit(type === 'all' ? 10 : limit)
                .toArray();
                
            results.users = users;
        }
        
        if (type === 'hashtags' || type === 'all') {
            const hashtagsCollection = database.collection("hashtags");
            const hashtags = await hashtagsCollection
                .find({ _id: searchRegex })
                .sort({ count: -1 })
                .skip(type === 'all' ? 0 : skip)
                .limit(type === 'all' ? 5 : limit)
                .toArray();
                
            results.hashtags = hashtags;
        }
        
        return NextResponse.json({
            query,
            results,
            pagination: {
                page,
                limit,
                type
            }
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Error performing search", details: error }, { status: 500 });
    }
}