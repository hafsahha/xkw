import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { ObjectId } from "mongodb";
import db from "@/lib/db";

// Fetch tweets (single or all)
export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const tweetCollection = database?.collection("tweets");
        const userCollection = database?.collection("users");
        const likeCollection = database?.collection("likes");
        const retweetCollection = database?.collection("retweets");
        const bookmarkCollection = database?.collection("bookmarks");
        
        const searchParams = req.nextUrl.searchParams;
        const currentUser = searchParams.get("currentUser");
        const username = searchParams.get("username");
        const id = searchParams.get("id");
        const type = searchParams.get("type"); // 'replies', 'media', 'likes'
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");
        
        // Fetch single tweet by ID
        if (id) {
            const tweet = await tweetCollection.findOne({ tweetId: id });
            if (!tweet) {
                return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
            }

            // Fetch replies
            const replies = await tweetCollection.find({ parentTweetId: tweet._id }).toArray();

            let isLiked = false, isRetweeted = false, isBookmarked = false;
            
            if (currentUser) {
                const currentUserDoc = await userCollection.findOne({ username: currentUser });
                if (currentUserDoc) {
                    isLiked = await likeCollection.findOne({ userId: currentUserDoc._id, tweetId: tweet._id }) !== null;
                    isRetweeted = await retweetCollection.findOne({ userId: currentUserDoc._id, tweetId: tweet._id }) !== null;
                    isBookmarked = await bookmarkCollection.findOne({ userId: currentUserDoc._id, tweetId: tweet._id }) !== null;
                }
            }
            
            return NextResponse.json({ 
                ...tweet, 
                userInteractions: { isLiked, isRetweeted, isBookmarked }, 
                replies: replies.length,
                repliesData: replies
            });
        }

        // Fetch tweets by username
        if (username) {
            if (searchParams.get("likedOnly") === "true") {
                const likedTweets = await likeCollection.find({ likedBy: username }).sort({ createdAt: -1 }).toArray();
                const detailedLikedTweets = await Promise.all(likedTweets.map(async (like) => {
                    const tweetObject = await tweetCollection.findOne({ _id: like.tweetId });
                    const isRetweeted = await retweetCollection.findOne({ retweetedBy: currentUser, tweetId: tweetObject?._id }) !== null;
                    const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: currentUser, tweetId: tweetObject?._id }) !== null;
                    return { ...tweetObject, isLiked: true, isRetweeted, isBookmarked };
                }));
                return NextResponse.json(detailedLikedTweets);
            }

            const includeReplies = searchParams.get("includeReplies") === "true";
            const mediaOnly = searchParams.get("mediaOnly") === "true";
            const query =
                includeReplies ? { "author.username": username } :
                mediaOnly ? { "author.username": username, media: { $exists: true, $ne: [] } } :
                { "author.username": username, type: "Original" };
                
            const userTweets = await tweetCollection.find(query).sort({ createdAt: -1 }).toArray();
            
            // Get retweets dari user ini
            const userRetweets = await retweetCollection.find({ retweetedBy: username }).toArray();
            const retweetedPosts = await Promise.all(
                userRetweets.map(async (retweet) => {
                    const originalPost = await tweetCollection.findOne({ _id: retweet.tweetId });
                    if (!originalPost) return null;
                    
                    const isLiked = await likeCollection.findOne({ likedBy: currentUser, tweetId: originalPost._id }) !== null;
                    const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: currentUser, tweetId: originalPost._id }) !== null;
                    
                    return {
                        ...originalPost,
                        type: "Retweet",
                        isLiked,
                        isRetweeted: true,
                        isBookmarked
                    };
                })
            ).then(results => results.filter(Boolean)); // Filter null values
            
            // Gabung & sort
            const allUserPosts = [...userTweets, ...retweetedPosts].sort((a, b) => {
                const dateA = (a as any)?.createdAt ? new Date((a as any).createdAt).getTime() : 0;
                const dateB = (b as any)?.createdAt ? new Date((b as any).createdAt).getTime() : 0;
                return dateB - dateA;
            });
            
            const detailedUserTweets = await Promise.all(allUserPosts.map(async (tweet) => {
                if (!tweet) return null;
                const isLiked = await likeCollection.findOne({ likedBy: currentUser, tweetId: (tweet as any)._id }) !== null
                const isRetweeted = await retweetCollection.findOne({ retweetedBy: currentUser, tweetId: (tweet as any)._id }) !== null;
                const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: currentUser, tweetId: (tweet as any)._id }) !== null
                return { ...tweet, isLiked, isRetweeted, isBookmarked };
            })).then(results => results.filter(Boolean));
            return NextResponse.json(detailedUserTweets);
        }
        
        // Fetch all tweets
        const allTweets = await tweetCollection.find({}).sort({ createdAt: -1 }).toArray();
        
        // Get retweets dari currentUser
        let allTweetsWithRetweets: any[] = allTweets;
        if (currentUser) {
            const userRetweets = await retweetCollection.find({ retweetedBy: currentUser }).toArray();
            const retweetedPostIds = new Set(userRetweets.map(r => (r.tweetId as any).toString()));
            
            // Filter out posts yang sudah di-retweet
            const filteredTweets = allTweets.filter(tweet => !retweetedPostIds.has((tweet._id as any).toString()));
            
            const retweetedPosts = await Promise.all(
                userRetweets.map(async (retweet) => {
                    const originalPost = await tweetCollection.findOne({ _id: retweet.tweetId });
                    if (!originalPost) return null;
                    return {
                        ...originalPost,
                        type: "Retweet",
                        isRetweeted: true
                    };
                })
            ).then(results => results.filter(Boolean));
            
            // Gabung & sort (now without duplicates)
            allTweetsWithRetweets = [...filteredTweets, ...retweetedPosts].sort((a, b) => {
                const dateA = (a as any)?.createdAt ? new Date((a as any).createdAt).getTime() : 0;
                const dateB = (b as any)?.createdAt ? new Date((b as any).createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
        
        const detailedAllTweets = await Promise.all(allTweetsWithRetweets.map(async (tweet) => {
            if (!tweet) return null;
            const isLiked = await likeCollection.findOne({ likedBy: currentUser, tweetId: (tweet as any)._id }) !== null;
            const isRetweeted = await retweetCollection.findOne({ retweetedBy: currentUser, tweetId: (tweet as any)._id }) !== null;
            const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: currentUser, tweetId: (tweet as any)._id }) !== null;
            return { ...tweet, isLiked, isRetweeted, isBookmarked };
        })).then(results => results.filter(Boolean));
        return NextResponse.json(detailedAllTweets);
    }
    return NextResponse.json({ message: "No tweets found" }, { status: 404 });
}

// Create a new tweet
export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const tweetCollection = database.collection("tweets");
        const userCollection = database.collection("users");
        const notificationsCollection = database.collection("notifications");

        const body = await req.json();
        const { username, content, media, tweetRef, type } = body;
        
        if (!username || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const authorObject = await userCollection.findOne({ username: username });
        if (!authorObject) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let refObject = null;
        if (tweetRef) {
            refObject = await tweetCollection.findOne({ tweetId: tweetRef });
            if (!refObject) {
                return NextResponse.json({ error: "Referenced tweet not found" }, { status: 404 });
            }
        }

        // Extract hashtags from content
        const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;
        const hashtags = content.match(hashtagRegex) || [];
        
        // Extract mentions from content
        const mentionRegex = /@[\w]+/gi;
        const mentions = content.match(mentionRegex) || [];

        const newTweet = {
            tweetId: "", // Will be updated after insert
            author: {
                userId: authorObject._id,
                name: authorObject.name,
                username: authorObject.username,
                avatar: authorObject.media?.profileImage || "/placeholder-avatar.png"
            },
            content,
            media: media || [],
            parentTweetId: refObject?._id || null,
            type: type || "Original",
            hashtags: hashtags.map(tag => tag.slice(1).toLowerCase()),
            mentions: mentions.map(mention => mention.slice(1).toLowerCase()),
            stats: { replies: 0, retweets: 0, quotes: 0, likes: 0 },
            createdAt: new Date()
        };

        const result = await tweetCollection.insertOne(newTweet);

        // Generate unique tweet ID
        const id = String(result.insertedId);
        const secret = process.env.TWEET_SECRET || "default_secret";
        const raw = createHmac("sha256", secret).update(id).digest("base64")
            .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const tweetId = raw.slice(0, 24);

        // Update tweet with generated ID
        await tweetCollection.updateOne({ _id: result.insertedId }, { $set: { tweetId: tweetId } });

        // Update parent tweet stats if this is a reply/retweet/quote
        if (refObject) {
            const statUpdate: { [key: string]: number } = {};
            let notificationType = "";
            
            switch (type) {
                case "Reply":
                    statUpdate["stats.replies"] = 1;
                    notificationType = "reply";
                    break;
                case "Retweet":
                    statUpdate["stats.retweets"] = 1;
                    notificationType = "retweet";
                    break;
                case "Quote":
                    statUpdate["stats.quotes"] = 1;
                    notificationType = "quote";
                    break;
            }
            
            if (Object.keys(statUpdate).length > 0) {
                await tweetCollection.updateOne({ _id: refObject._id }, { $inc: statUpdate });
                
                // Create notification for the original tweet author
                if (refObject.author.userId.toString() !== authorObject._id.toString()) {
                    await notificationsCollection.insertOne({
                        receiverId: refObject.author.userId,
                        actor: {
                            userId: authorObject._id,
                            username: authorObject.username,
                            name: authorObject.name,
                            avatar: authorObject.media?.profileImage || "/placeholder-avatar.png"
                        },
                        type: notificationType,
                        tweetId: refObject._id,
                        isRead: false,
                        createdAt: new Date()
                    });
                }
            }
        }

        // Update user tweet count
        await userCollection.updateOne({ username: username }, { $inc: { "stats.tweetCount": 1 } });

        // Update hashtags
        if (hashtags.length > 0) {
            const hashtagsCollection = database.collection("hashtags");
            const hashtagUpdates = hashtags.map(tag => ({
                updateOne: {
                    filter: { _id: tag.slice(1).toLowerCase() },
                    update: { 
                        $inc: { count: 1 },
                        $set: { lastUsed: new Date() }
                    },
                    upsert: true
                }
            }));
            await hashtagsCollection.bulkWrite(hashtagUpdates);
        }

        // Create mention notifications
        if (mentions.length > 0) {
            const mentionedUsers = await userCollection.find({ 
                username: { $in: mentions.map(mention => mention.slice(1).toLowerCase()) }
            }).toArray();

            const mentionNotifications = mentionedUsers
                .filter(user => user._id.toString() !== authorObject._id.toString())
                .map(user => ({
                    receiverId: user._id,
                    actor: {
                        userId: authorObject._id,
                        username: authorObject.username,
                        name: authorObject.name,
                        avatar: authorObject.media?.profileImage || "/placeholder-avatar.png"
                    },
                    type: "mention",
                    tweetId: result.insertedId,
                    isRead: false,
                    createdAt: new Date()
                }));

            if (mentionNotifications.length > 0) {
                await notificationsCollection.insertMany(mentionNotifications);
            }
        }

        return NextResponse.json({ 
            message: "Tweet created successfully", 
            tweetId,
            tweet: { ...newTweet, _id: result.insertedId, tweetId }
        }, { status: 201 });
        
    } catch (error) {
        return NextResponse.json({ error: "Error creating tweet", details: error }, { status: 500 });
    }
}

// Delete a tweet
export async function DELETE(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const tweetCollection = database.collection("tweets");
        const userCollection = database.collection("users");
        const likesCollection = database.collection("likes");
        const retweetsCollection = database.collection("retweets");
        const bookmarksCollection = database.collection("bookmarks");
        const notificationsCollection = database.collection("notifications");

        const { searchParams } = new URL(req.url);
        const tweetId = searchParams.get('tweetId');
        const username = searchParams.get('username');

        if (!tweetId || !username) {
            return NextResponse.json({ error: "Tweet ID and username are required" }, { status: 400 });
        }

        const tweet = await tweetCollection.findOne({ tweetId });
        if (!tweet) {
            return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
        }

        // Check if user owns the tweet
        if (tweet.author.username !== username) {
            return NextResponse.json({ error: "Unauthorized to delete this tweet" }, { status: 403 });
        }

        // Delete the tweet
        await tweetCollection.deleteOne({ _id: tweet._id });

        // Delete related data
        await Promise.all([
            likesCollection.deleteMany({ tweetId: tweet._id }),
            retweetsCollection.deleteMany({ tweetId: tweet._id }),
            bookmarksCollection.deleteMany({ tweetId: tweet._id }),
            notificationsCollection.deleteMany({ tweetId: tweet._id })
        ]);

        // Update user tweet count
        await userCollection.updateOne(
            { username },
            { $inc: { "stats.tweetCount": -1 } }
        );

        // If this was a reply/retweet/quote, update parent tweet stats
        if (tweet.parentTweetId) {
            const statUpdate: { [key: string]: number } = {};
            
            switch (tweet.type) {
                case "Reply":
                    statUpdate["stats.replies"] = -1;
                    break;
                case "Retweet":
                    statUpdate["stats.retweets"] = -1;
                    break;
                case "Quote":
                    statUpdate["stats.quotes"] = -1;
                    break;
            }
            
            if (Object.keys(statUpdate).length > 0) {
                await tweetCollection.updateOne({ _id: tweet.parentTweetId }, { $inc: statUpdate });
            }
        }

        return NextResponse.json({ message: "Tweet deleted successfully" });
        
    } catch (error) {
        return NextResponse.json({ error: "Error deleting tweet", details: error }, { status: 500 });
    }
}
