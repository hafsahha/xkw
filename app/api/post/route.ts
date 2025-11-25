import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import db from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

// Fetch tweets (by ID, by username, or all)
export async function GET(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const userCollection = database?.collection("users");
    const likeCollection = database?.collection("likes");
    const retweetCollection = database?.collection("retweets");
    const bookmarkCollection = database?.collection("bookmarks");
    
    if (tweetCollection && userCollection && likeCollection && bookmarkCollection) {
        const searchParams = req.nextUrl.searchParams;
        const findRoot = searchParams.get("findRoot") === "true";
        const quote = searchParams.get("quote") === "true";
        const currentUser = searchParams.get("currentUser");
        const username = searchParams.get("username");
        const tweetstats = searchParams.get("tweetstats");
        const id = searchParams.get("id");

        // Get tweet stats only
        if (tweetstats) {
            const tweet = await tweetCollection.findOne({ tweetId: tweetstats });
            if (tweet) return NextResponse.json(tweet.stats)
            return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
        }

        if (!currentUser) return NextResponse.json({ message: "Current user is required" }, { status: 400 });
        const userObject = await userCollection.findOne({ username: currentUser });
        if (!userObject) return NextResponse.json({ message: "Current user not found" }, { status: 404 });
        
        // Get a single tweet data by tweet ID
        if (id) {
            const tweet = await tweetCollection.findOne({ tweetId: id });
            if (tweet) {
                if (quote) {
                    const quotedTweet = await tweetCollection.findOne({ _id: tweet.parentTweetId });
                    return NextResponse.json(quotedTweet);
                }
                
                if (findRoot) {
                    const parents = [];
                    let currentTweet = tweet;
                    while (currentTweet && currentTweet.parentTweetId) {
                        const parentTweet = await tweetCollection.findOne({ _id: currentTweet.parentTweetId });
                        if (parentTweet) {
                            parents.unshift(parentTweet);
                            currentTweet = parentTweet;
                        } else break;
                    }
                    return NextResponse.json(parents.length > 0 ? parents : null);
                }

                const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: tweet._id }) !== null;
                const isRetweeted = await retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: tweet._id }) !== null;
                const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: tweet._id }) !== null;
                
                // Get replies
                const replies = await tweetCollection.find({ parentTweetId: tweet._id }).toArray();
                const detailedReplies = await Promise.all(replies.map(async (reply) => {
                    const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: reply._id }) !== null;
                    const isRetweeted = await retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: reply._id }) !== null;
                    const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: reply._id }) !== null;
                    return { ...reply, isLiked, isRetweeted, isBookmarked };
                }));
                return NextResponse.json({ ...tweet, isLiked, isRetweeted, isBookmarked, replies: detailedReplies });
            }
            return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
        }

        // Get all tweets by username
        if (username) {
            const targetObject = await userCollection.findOne({ username });
            if (!targetObject) return NextResponse.json({ message: "User not found" }, { status: 404 });

            // Filter liked tweets only
            if (searchParams.get("likedOnly") === "true") {
                const likedTweets = await likeCollection.find({ likedBy: targetObject._id }).sort({ createdAt: -1 }).toArray();
                const detailedLikedTweets = await Promise.all(likedTweets.map(async (like) => {
                    const tweetObject = await tweetCollection.findOne({ _id: like.tweetId });
                    const isRetweeted = await retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: tweetObject?._id }) !== null;
                    const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: tweetObject?._id }) !== null;
                    return { ...tweetObject, isLiked: true, isRetweeted, isBookmarked };
                }));
                return NextResponse.json(detailedLikedTweets);
            }

            // Filter bookmarked tweets only
            if (searchParams.get("bookmarkedOnly") === "true") {
                const bookmarkedTweets = await bookmarkCollection.find({ bookmarkedBy: targetObject._id }).sort({ createdAt: -1 }).toArray();
                const detailedBookmarkedTweets = await Promise.all(bookmarkedTweets.map(async (bookmark) => {
                    const tweetObject = await tweetCollection.findOne({ _id: bookmark.tweetId });
                    const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: tweetObject?._id }) !== null;
                    const isRetweeted = await retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: tweetObject?._id }) !== null;
                    return { ...tweetObject, isLiked, isRetweeted, isBookmarked: true };
                }));
                return NextResponse.json(detailedBookmarkedTweets);
            }

            const includeReplies = searchParams.get("includeReplies") === "true"; // Include reply tweets
            const mediaOnly = searchParams.get("mediaOnly") === "true"; // Filter media only tweets
            
            // Fetch user tweets based on filters
            const query =
                includeReplies ? { "author.username": username } :
                mediaOnly ? { "author.username": username, media: { $exists: true, $ne: [] } } :
                { "author.username": username, type: "Original" };
                
            const userTweets = await tweetCollection.find(query).sort({ createdAt: -1 }).toArray();
            let detailedUserTweets = await Promise.all(userTweets.map(async (tweet) => {
                if (!tweet) return null;
                const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: tweet._id }) !== null
                const isRetweeted = await retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: tweet._id }) !== null;
                const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: tweet._id }) !== null
                return { ...tweet, isLiked, isRetweeted, isBookmarked };
            })).then(results => results.filter(Boolean));
            
            // Get user retweets
            if (!mediaOnly) {
                const userRetweets = await retweetCollection.find({ retweetedBy: targetObject._id }).toArray();
                const retweetedPosts = await Promise.all(userRetweets.map(async (retweet) => {
                    const originalPost = await tweetCollection.findOne({ _id: retweet.tweetId });
                    if (!originalPost) return null;
                    
                    const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: originalPost._id }) !== null;
                    const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: originalPost._id }) !== null;
                    return { ...originalPost, type: "Retweet", isLiked, isRetweeted: true, isBookmarked, retweetedAt: retweet.createdAt };
                })).then(results => results.filter(Boolean)); // Filter null values
                
                // Combine & sort all posts, using retweetedAt for retweets when available
                detailedUserTweets = [...detailedUserTweets, ...retweetedPosts].sort((tweetA, tweetB) => {
                    const timeOf = (t: any) => {
                        if (t?.type === "Retweet") return new Date(t.retweetedAt).getTime();
                        else return new Date(t.createdAt).getTime();
                    };
                    return timeOf(tweetB) - timeOf(tweetA);
                })
            }
            return NextResponse.json(detailedUserTweets);
        }
        
        // Fetch all tweets
        const allTweets = await tweetCollection.find({}).sort({ createdAt: -1 }).toArray();
        let detailedAllTweets = await Promise.all(allTweets.map(async (tweet) => {
            if (!tweet) return null;
            const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: tweet._id }) !== null;
            const isRetweeted = await retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: tweet._id }) !== null;
            const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: tweet._id }) !== null;
            return { ...tweet, isLiked, isRetweeted, isBookmarked };
        })).then(results => results.filter(Boolean));
        
        // Get retweets from currentUser
        const userRetweets = await retweetCollection.find({ retweetedBy: userObject._id }).toArray();
        
        const retweetedPosts = await Promise.all(
            userRetweets.map(async (retweet) => {
                const originalPost = await tweetCollection.findOne({ _id: retweet.tweetId });
                if (!originalPost) return null;
                
                const isLiked = await likeCollection.findOne({ likedBy: userObject._id, tweetId: originalPost._id }) !== null;
                const isBookmarked = await bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: originalPost._id }) !== null;
                return { ...originalPost, type: "Retweet", isLiked, isRetweeted: true, isBookmarked, retweetedAt: retweet.createdAt };
            })
        ).then(results => results.filter(Boolean));
        
        // Gabung & sort (now without duplicates)
        detailedAllTweets = [...detailedAllTweets, ...retweetedPosts].sort((tweetA, tweetB) => {
            const timeOf = (t: any) => {
                if (t?.type === "Retweet") return new Date(t.retweetedAt).getTime();
                else return new Date(t.createdAt).getTime();
            };
            return timeOf(tweetB) - timeOf(tweetA);
        });
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
        try {
            const body = await req.json();
            const { username, content, media, tweetRef, type } = body;
            
            console.log("[POST /api/post] Attempting to create tweet:", { username, content: content.substring(0, 50), type });
            
            if (!username || !content) {
                console.error("[POST /api/post] Missing required fields:", { username, content });
                return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
            }

            const authorObject = await userCollection.findOne({ username: username });
            if (!authorObject) {
                console.error("[POST /api/post] Author not found:", username);
                return NextResponse.json({ message: "Author not found" }, { status: 404 });
            }
            
            const refObject = tweetRef ? await tweetCollection.findOne({ tweetId: tweetRef }) : null;
            const newTweet = {
                author: {
                    name: authorObject?.name,
                    username: authorObject?.username,
                    avatar: authorObject?.media?.avatar || "default_avatar.png",
                },
                content: content.trim(),
                media: media || [],
                parentTweetId: refObject?._id,
                type: type || "Original",
                stats: { replies: 0, retweets: 0, quotes: 0, likes: 0 },
                createdAt: new Date()
            };
            
            console.log("[POST /api/post] Creating new tweet object with author:", authorObject.username);
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
            
            // Update user tweetCount (not stats.tweetCount)
            await userCollection.updateOne({ username: username }, { $inc: { tweetCount: 1 } });
            await tweetCollection.updateOne({ _id: result.insertedId }, { $set: { tweetId: tweetId } });
            
            console.log("[POST /api/post] ✅ Tweet created successfully:", { tweetId, author: username });
            return NextResponse.json({ message: "Tweet created", tweetId }, { status: 201 });
        } catch (error) {
            console.error("[POST /api/post] ERROR:", error);
            return NextResponse.json(
                { message: "Failed to create tweet", error: String(error) },
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ message: "Failed to create tweet" }, { status: 500 });
}

// Delete a tweet
export async function DELETE(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const userCollection = database?.collection("users");
    const likeCollection = database?.collection("likes");
    const retweetCollection = database?.collection("retweets");
    const bookmarkCollection = database?.collection("bookmarks");

    if (tweetCollection && userCollection && likeCollection && retweetCollection && bookmarkCollection) {
        try {
            const body = await req.json();
            const { tweetId, username } = body;
            
            console.log("[DELETE /api/post] Attempting to delete tweet:", { tweetId, username });
            
            if (!tweetId || !username) {
                return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
            }

            // Find the tweet
            const tweet = await tweetCollection.findOne({ tweetId: tweetId });
            if (!tweet) {
                console.error("[DELETE /api/post] Tweet not found:", tweetId);
                return NextResponse.json({ message: "Tweet not found" }, { status: 404 });
            }

            // Check if the current user is the author
            if (tweet.author.username !== username) {
                console.error("[DELETE /api/post] Unauthorized:", { tweetAuthor: tweet.author.username, requestUser: username });
                return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
            }

            // Delete the tweet
            await tweetCollection.deleteOne({ tweetId: tweetId });

            // Delete media files if tweet has media
            if (tweet.media && tweet.media.length > 0) {
                for (const mediaUrl of tweet.media) {
                    try {
                        let fileName = mediaUrl;
                        if (mediaUrl.includes('/')) {
                            fileName = mediaUrl.split('/').pop() || mediaUrl;
                        }
                        
                        const filePath = path.join(uploadDir, fileName);
                        
                        // Check if file exists before deleting
                        try {
                            await fs.access(filePath);
                            await fs.unlink(filePath);
                            console.log(`[DELETE /api/post] Deleted media file: ${fileName}`);
                        } catch (accessError) {
                            console.warn(`[DELETE /api/post] Media file not found, skipping: ${fileName}`);
                            // Don't fail if file doesn't exist
                        }
                    } catch (fileError) {
                        console.warn(`[DELETE /api/post] Error deleting media file ${mediaUrl}:`, fileError);
                        // Continue deleting tweet even if media deletion fails
                    }
                }
            }

            // Delete all related data (likes, retweets, bookmarks)
            await likeCollection.deleteMany({ tweetId: tweet._id });
            await retweetCollection.deleteMany({ tweetId: tweet._id });
            await bookmarkCollection.deleteMany({ tweetId: tweet._id });

            // Delete all replies to this tweet
            const replies = await tweetCollection.find({ parentTweetId: tweet._id }).toArray();
            for (const reply of replies) {
                await tweetCollection.deleteOne({ _id: reply._id });
                await likeCollection.deleteMany({ tweetId: reply._id });
                await retweetCollection.deleteMany({ tweetId: reply._id });
                await bookmarkCollection.deleteMany({ tweetId: reply._id });
            }

            // Update user stats
            await userCollection.updateOne({ username: username }, { $inc: { tweetCount: -1 } });

            // If this is a reply, decrement parent's reply count
            if (tweet.parentTweetId) {
                const parentTweet = await tweetCollection.findOne({ _id: tweet.parentTweetId });
                if (parentTweet) {
                    await tweetCollection.updateOne({ _id: tweet.parentTweetId }, { $inc: { "stats.replies": -1 } });
                }
            }

            console.log("[DELETE /api/post] ✅ Tweet deleted successfully:", tweetId);
            return NextResponse.json({ message: "Tweet deleted successfully" }, { status: 200 });
        } catch (error) {
            console.error("[DELETE /api/post] ERROR:", error);
            return NextResponse.json({ message: "Failed to delete tweet", error: String(error) }, { status: 500 });
        }
    }
    return NextResponse.json({ message: "Failed to delete tweet" }, { status: 500 });
}