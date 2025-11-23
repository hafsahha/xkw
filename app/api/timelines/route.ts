import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const tweetsCollection = database.collection("tweets");
        const likesCollection = database.collection("likes");
        const retweetsCollection = database.collection("retweets");
        const bookmarksCollection = database.collection("bookmarks");
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type'); // 'home', 'user', 'media', 'likes'
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const targetUserId = searchParams.get('targetUserId');
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        
        const skip = (page - 1) * limit;
        let tweets: any[] = [];
        
        if (type === 'home') {
            // Get tweets from users that this user follows + own tweets
            const followsCollection = database.collection("follows");
            const following = await followsCollection.find({ followerId: new ObjectId(userId) }).toArray();
            const followingIds = following.map(f => f.followingId);
            followingIds.push(new ObjectId(userId)); // Include own tweets
            
            tweets = await tweetsCollection
                .find({ "author.userId": { $in: followingIds } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
                
        } else if (type === 'user' && targetUserId) {
            // Get tweets from specific user
            tweets = await tweetsCollection
                .find({ "author.userId": new ObjectId(targetUserId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
                
        } else if (type === 'media' && targetUserId) {
            // Get tweets with media from specific user
            tweets = await tweetsCollection
                .find({ 
                    "author.userId": new ObjectId(targetUserId),
                    "media.0": { $exists: true }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
                
        } else if (type === 'likes' && targetUserId) {
            // Get tweets liked by specific user
            const userLikes = await likesCollection
                .find({ userId: new ObjectId(targetUserId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
                
            const tweetIds = userLikes.map(like => like.tweetId);
            tweets = await tweetsCollection
                .find({ _id: { $in: tweetIds } })
                .toArray();
                
            // Maintain the order from likes
            tweets = userLikes.map(like => 
                tweets.find(tweet => tweet._id.toString() === like.tweetId.toString())
            ).filter(Boolean);
            
        } else {
            // Get all tweets (public timeline)
            tweets = await tweetsCollection
                .find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
        }
        
        // Enrich tweets with user interaction data
        const enrichedTweets = await Promise.all(
            tweets.map(async (tweet) => {
                const [isLiked, isRetweeted, isBookmarked] = await Promise.all([
                    likesCollection.findOne({ userId: new ObjectId(userId), tweetId: tweet._id }),
                    retweetsCollection.findOne({ userId: new ObjectId(userId), tweetId: tweet._id }),
                    bookmarksCollection.findOne({ userId: new ObjectId(userId), tweetId: tweet._id })
                ]);
                
                return {
                    ...tweet,
                    userInteractions: {
                        isLiked: !!isLiked,
                        isRetweeted: !!isRetweeted,
                        isBookmarked: !!isBookmarked
                    }
                };
            })
        );
        
        return NextResponse.json({ 
            tweets: enrichedTweets,
            pagination: {
                page,
                limit,
                hasMore: enrichedTweets.length === limit
            }
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching timeline", details: error }, { status: 500 });
    }
}