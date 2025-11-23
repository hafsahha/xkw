import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const retweetsCollection = database.collection("retweets");
        const userCollection = database.collection("users");
        const tweetCollection = database.collection("tweets");
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        const tweetId = searchParams.get('tweetId');
        
        if (userId || username) {
            let user;
            if (userId) {
                user = { _id: new ObjectId(userId) };
            } else {
                user = await userCollection.findOne({ username });
                if (!user) {
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }
            }
            
            const retweets = await retweetsCollection
                .find({ userId: user._id })
                .sort({ createdAt: -1 })
                .toArray();
                
            // Get tweet details for retweets
            const retweetsWithTweets = await Promise.all(
                retweets.map(async (retweet) => {
                    const tweet = await tweetCollection.findOne({ _id: retweet.tweetId });
                    return { ...retweet, tweet };
                })
            );
            
            return NextResponse.json({ 
                retweets: retweetsWithTweets,
                count: retweets.length 
            });
        }
        
        if (tweetId) {
            // Get users who retweeted a specific tweet
            const tweetRetweets = await retweetsCollection
                .find({ tweetId: new ObjectId(tweetId) })
                .toArray();
                
            const retweeters = await Promise.all(
                tweetRetweets.map(async (retweet) => {
                    const user = await userCollection.findOne({ _id: retweet.userId }, { projection: { password: 0 } });
                    return { ...retweet, user };
                })
            );
            
            return NextResponse.json({ 
                retweeters: retweeters.filter(r => r.user),
                count: retweeters.length 
            });
        }
        
        // Get all retweets
        const allRetweets = await retweetsCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
            
        return NextResponse.json({ 
            retweets: allRetweets,
            count: allRetweets.length 
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching retweets", details: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const retweetsCollection = database.collection("retweets");
        const tweetCollection = database.collection("tweets");
        const userCollection = database.collection("users");
        const notificationsCollection = database.collection("notifications");

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

        // Check if user already retweeted this tweet
        const existingRetweet = await retweetsCollection.findOne({ 
            userId: user._id, 
            tweetId: tweet._id 
        });
        
        if (existingRetweet) {
            // Un-retweet
            await retweetsCollection.deleteOne({ _id: existingRetweet._id });
            await tweetCollection.updateOne({ _id: tweet._id }, { $inc: { "stats.retweets": -1 } });
            
            return NextResponse.json({ 
                message: "Tweet un-retweeted successfully", 
                isRetweeted: false 
            }, { status: 200 });
        } else {
            // Retweet
            const newRetweet = {
                userId: user._id,
                tweetId: tweet._id,
                createdAt: new Date()
            };
            
            await retweetsCollection.insertOne(newRetweet);
            await tweetCollection.updateOne({ _id: tweet._id }, { $inc: { "stats.retweets": 1 } });
            
            // Create notification if not retweeting own tweet
            if (tweet.author.userId.toString() !== user._id.toString()) {
                await notificationsCollection.insertOne({
                    receiverId: tweet.author.userId,
                    actor: {
                        userId: user._id,
                        username: user.username,
                        name: user.name,
                        avatar: user.media?.profileImage || "/placeholder-avatar.png"
                    },
                    type: "retweet",
                    tweetId: tweet._id,
                    isRead: false,
                    createdAt: new Date()
                });
            }
            
            return NextResponse.json({ 
                message: "Tweet retweeted successfully", 
                isRetweeted: true 
            }, { status: 201 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error processing retweet", details: error }, { status: 500 });
    }
}