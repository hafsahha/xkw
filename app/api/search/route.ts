import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Search tweets by content, username, or hashtags
export async function GET(req: NextRequest) {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const userCollection = database?.collection("users");
    const likeCollection = database?.collection("likes");
    const retweetCollection = database?.collection("retweets");
    const bookmarkCollection = database?.collection("bookmarks");

    if (tweetCollection && userCollection && likeCollection && retweetCollection && bookmarkCollection) {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get("q")?.trim(); // Search query
        const currentUser = searchParams.get("currentUser");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");
        const type = searchParams.get("type") || "all"; // "tweets", "users", "all"
        const mediaOnly = searchParams.get("media") === "true";
        const fromUser = searchParams.get("from"); // Search from specific user

        if (!query) {
            return NextResponse.json({ message: "Search query is required" }, { status: 400 });
        }

        if (!currentUser) {
            return NextResponse.json({ message: "Current user is required" }, { status: 400 });
        }

        const userObject = await userCollection.findOne({ username: currentUser });
        if (!userObject) {
            return NextResponse.json({ message: "Current user not found" }, { status: 404 });
        }

        let searchResults: any = {
            tweets: [],
            users: [],
            hashtags: []
        };

        // Search tweets by content
        if (type === "tweets" || type === "all") {
            // Build search filter
            let tweetFilter: any = {
                $or: [
                    { content: { $regex: query, $options: "i" } }, // Case-insensitive content search
                    { "author.name": { $regex: query, $options: "i" } }, // Search by author name
                    { "author.username": { $regex: query, $options: "i" } } // Search by username
                ]
            };

            // Add media filter
            if (mediaOnly) {
                tweetFilter.media = { $exists: true, $not: { $size: 0 } };
            }

            // Filter by specific user
            if (fromUser) {
                tweetFilter["author.username"] = fromUser;
            }

            console.log("[SEARCH] Tweet search filter:", JSON.stringify(tweetFilter));

            // Get tweets matching the search
            const tweets = await tweetCollection
                .find(tweetFilter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray();

            console.log("[SEARCH] Found tweets:", tweets.length);

            // Add interaction data for each tweet
            const tweetsWithInteractions = await Promise.all(
                tweets.map(async (tweet) => {
                    const [isLiked, isRetweeted, isBookmarked] = await Promise.all([
                        likeCollection.findOne({ likedBy: userObject._id, tweetId: tweet._id }) !== null,
                        retweetCollection.findOne({ retweetedBy: userObject._id, tweetId: tweet._id }) !== null,
                        bookmarkCollection.findOne({ bookmarkedBy: userObject._id, tweetId: tweet._id }) !== null
                    ]);

                    return {
                        ...tweet,
                        tweetId: tweet.tweetId,
                        isLiked,
                        isRetweeted,
                        isBookmarked
                    };
                })
            );

            searchResults.tweets = tweetsWithInteractions;
        }

        // Search users by name or username
        if (type === "users" || type === "all") {
            const users = await userCollection
                .find({
                    $or: [
                        { name: { $regex: query, $options: "i" } },
                        { username: { $regex: query, $options: "i" } },
                        { bio: { $regex: query, $options: "i" } }
                    ]
                })
                .limit(type === "users" ? limit : 10) // Limit user results when searching all
                .toArray();

            console.log("[SEARCH] Found users:", users.length);

            // Add follow status for each user
            const followsCollection = database?.collection("follows");
            const usersWithFollowStatus = await Promise.all(
                users.map(async (user) => {
                    const isFollowing = followsCollection ? 
                        await followsCollection.findOne({ 
                            followerId: userObject._id, 
                            followingId: user._id 
                        }) !== null : false;

                    return {
                        _id: user._id,
                        username: user.username,
                        name: user.name,
                        bio: user.bio || "",
                        avatar: user.media?.avatar || "default_avatar.png",
                        stats: user.stats || { followers: 0, following: 0, tweetCount: 0 },
                        isFollowing,
                        isCurrentUser: user.username === currentUser
                    };
                })
            );

            searchResults.users = usersWithFollowStatus;
        }

        // Search hashtags (extract from tweet content)
        if (type === "hashtags" || type === "all") {
            const hashtagRegex = /#[\w\u0590-\u05ff]+/gi;
            
            // Search for tweets containing hashtags similar to query
            const hashtagTweets = await tweetCollection
                .find({
                    content: { $regex: `#.*${query}`, $options: "i" }
                })
                .toArray();

            // Extract and count hashtags
            const hashtagCounts: { [key: string]: number } = {};
            
            hashtagTweets.forEach(tweet => {
                const matches = tweet.content.match(hashtagRegex);
                if (matches) {
                    matches.forEach((hashtag: string) => {
                        const cleanHashtag = hashtag.toLowerCase();
                        if (cleanHashtag.includes(query.toLowerCase())) {
                            hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
                        }
                    });
                }
            });

            // Convert to array and sort by count
            const hashtags = Object.entries(hashtagCounts)
                .map(([hashtag, count]) => ({ hashtag, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            searchResults.hashtags = hashtags;
        }

        // Add search metadata
        const totalTweets = searchResults.tweets.length;
        const hasMore = totalTweets === limit;

        console.log("[SEARCH] Search completed:", {
            query,
            totalTweets,
            totalUsers: searchResults.users.length,
            totalHashtags: searchResults.hashtags.length
        });

        return NextResponse.json({
            ...searchResults,
            query,
            hasMore,
            limit,
            offset
        });
    }

    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}