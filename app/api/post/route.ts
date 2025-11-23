import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import db from "@/lib/db";

// Fetch tweets (single or all)
export async function GET(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const userCollection = database?.collection("users");
    const likeCollection = database?.collection("likes");
    const retweetCollection = database?.collection("retweets");
    const bookmarkCollection = database?.collection("bookmarks");
    
    if (tweetCollection && userCollection && likeCollection && bookmarkCollection) {
        const searchParams = req.nextUrl.searchParams;
        const currentUser = searchParams.get("currentUser");
        const username = searchParams.get("username");
        const id = searchParams.get("id");
        
        // Fetch single tweet by ID
        if (id) {
            const tweet = await tweetCollection.findOne({ tweetId: id });
            if (tweet) {
                // Fetch replies
                const replies = await tweetCollection.find({ parentTweetId: tweet._id }).toArray();

                const isLiked = await likeCollection.findOne({ likedBy: currentUser, tweetId: tweet._id }) !== null;
                const isRetweeted = await retweetCollection.findOne({ RetweetedBy: currentUser, tweetId: tweet._id }) !== null;
                const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: currentUser, tweetId: tweet._id }) !== null;
                return NextResponse.json({ ...tweet, isLiked, isRetweeted, isBookmarked, replies });
            }
            return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
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
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const userCollection = database?.collection("users");

    if (tweetCollection && userCollection) {
        const body = await req.json();
        const { username, content, media, tweetRef, type } = body;
        if (!username || !content) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const authorObject = await userCollection.findOne({ username: username });
        const refObject = tweetRef ? await tweetCollection.findOne({ tweetId: tweetRef }) : null;
        const newTweet = {
            author: {
                userId: authorObject?.userId,
                name: authorObject?.name,
                username: authorObject?.username,
                avatar: authorObject?.media.profileImage
            },
            content,
            media: media || [],
            parentTweetId: refObject?._id,
            type: type || "Original",
            stats: { replies: 0, retweets: 0, quotes: 0, likes: 0 },
            createdAt: new Date().toISOString()
        };
        const result = await tweetCollection.insertOne(newTweet);

        const id = String(result.insertedId);
        const secret = process.env.TWEET_SECRET || "default_secret";
        const raw = createHmac("sha256", secret).update(id).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const tweetId = raw.slice(0, 24);

        if (refObject) {
            switch (type) {
                case "Reply":
                    await tweetCollection.updateOne({ _id: refObject._id }, { $inc: { "stats.replies": 1 } });
                    break;
                case "Retweet":
                    await tweetCollection.updateOne({ _id: refObject._id }, { $inc: { "stats.retweets": 1 } });
                    break;
                case "Quote":
                    await tweetCollection.updateOne({ _id: refObject._id }, { $inc: { "stats.quotes": 1 } });
                    break;
            }
        }
        await userCollection.updateOne({ username: username }, { $inc: { "stats.tweetCount": 1 } });
        await tweetCollection.updateOne({ _id: result.insertedId }, { $set: { tweetId: tweetId } });
        return NextResponse.json({ message: "Tweet created", tweetId }, { status: 201 });
    }
    return NextResponse.json({ message: "Failed to create tweet" }, { status: 500 });
}