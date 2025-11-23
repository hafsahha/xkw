import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import db from "@/lib/db";

// Get likes data
export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const likeCollection = database.collection("likes");
        const userCollection = database.collection("users");

        const searchParams = req.nextUrl.searchParams;
        const tweetId = searchParams.get("tweetId");
        const userId = searchParams.get("userId");
        const username = searchParams.get("username");

        if (tweetId) {
            // Get users who liked a specific tweet
            const tweetLikes = await likeCollection.find({ tweetId: new ObjectId(tweetId) }).toArray();
            const likers = await Promise.all(tweetLikes.map(async (like) => {
                return await userCollection.findOne({ _id: like.userId }, { projection: { password: 0 } });
            }));
            return NextResponse.json({ likers: likers.filter(Boolean), count: likers.length });
        }
        
        if (userId) {
            // Get tweets liked by a specific user
            const userLikes = await likeCollection.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
            return NextResponse.json({ likes: userLikes, count: userLikes.length });
        }
        
        if (username) {
            // Get tweets liked by username
            const user = await userCollection.findOne({ username });
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            
            const userLikes = await likeCollection.find({ userId: user._id }).sort({ createdAt: -1 }).toArray();
            return NextResponse.json({ likes: userLikes, count: userLikes.length });
        }
        
        // Get all likes
        const allLikes = await likeCollection.find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ likes: allLikes, count: allLikes.length });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching likes", details: error }, { status: 500 });
    }
}

// Toggle like/unlike for a tweet
export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const likeCollection = database.collection("likes");
        const tweetCollection = database.collection("tweets");
        const userCollection = database.collection("users");
        const notificationsCollection = database.collection("notifications");

        const body = await req.json();
        const { username, tweetId } = body;
        
        if (!username || !tweetId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [user, tweet] = await Promise.all([
            userCollection.findOne({ username }),
            tweetCollection.findOne({ tweetId })
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        if (!tweet) {
            return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
        }

        const existingLike = await likeCollection.findOne({ userId: user._id, tweetId: tweet._id });
        
        if (existingLike) {
            // Unlike
            await likeCollection.deleteOne({ _id: existingLike._id });
            await tweetCollection.updateOne({ _id: tweet._id }, { $inc: { "stats.likes": -1 } });
            
            return NextResponse.json({ 
                message: "Tweet unliked successfully", 
                isLiked: false 
            }, { status: 200 });
        } else {
            // Like
            const newLike = {
                userId: user._id,
                tweetId: tweet._id,
                createdAt: new Date()
            };
            
            await likeCollection.insertOne(newLike);
            await tweetCollection.updateOne({ _id: tweet._id }, { $inc: { "stats.likes": 1 } });
            
            // Create notification if not liking own tweet
            if (tweet.author.userId.toString() !== user._id.toString()) {
                await notificationsCollection.insertOne({
                    receiverId: tweet.author.userId,
                    actor: {
                        userId: user._id,
                        username: user.username,
                        name: user.name,
                        avatar: user.media?.profileImage || "/placeholder-avatar.png"
                    },
                    type: "like",
                    tweetId: tweet._id,
                    isRead: false,
                    createdAt: new Date()
                });
            }
            
            return NextResponse.json({ 
                message: "Tweet liked successfully", 
                isLiked: true 
            }, { status: 201 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error processing like", details: error }, { status: 500 });
    }
}
    const tweetCollection = database?.collection("tweets");

    if (likeCollection && tweetCollection) {
        const body = await req.json();
        const { username, tweetId } = body;
        if (!username || !tweetId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const tweetObject = await tweetCollection.findOne({ tweetId: tweetId });
        if (!tweetObject) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        const existingLike = await likeCollection.findOne({ likedBy: username, tweetId: tweetObject._id });
        if (existingLike) {
            // If like exists, remove it (unlike)
            await likeCollection.deleteOne({ _id: existingLike._id });
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": -1 } });
            return NextResponse.json({ message: "Post unliked successfully" }, { status: 200 });
        } else {
            // If like doesn't exist, create it
            const newLike = {
                tweetId: tweetObject._id,
                likedBy: username,
                createdAt: new Date().toISOString(),
            };
            await likeCollection.insertOne(newLike);
            await tweetCollection.updateOne({ _id: tweetObject._id }, { $inc: { "stats.likes": 1 } });
            return NextResponse.json({ message: "Post liked successfully" }, { status: 201 });
        }
    }
}