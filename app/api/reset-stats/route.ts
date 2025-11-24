import db from "@/lib/db";

export async function GET() {
    const database = await db;
    const tweetCollection = database?.collection("tweets");
    const likeCollection = database?.collection("likes");
    const retweetCollection = database?.collection("retweets");
    const bookmarkCollection = database?.collection("bookmarks");
    const userCollection = database?.collection("users");
    const followCollection = database?.collection("follows");

    if (tweetCollection && userCollection) {
        // Reset stats for all tweets
        await tweetCollection.find({}).toArray().then(async (tweets) => {
            for (const tweet of tweets) {
                const tweetId = tweet._id;
                const likesCount = await likeCollection.countDocuments({ tweetId: tweetId });
                const retweetsCount = await retweetCollection.countDocuments({ tweetId: tweetId });
                const bookmarksCount = await bookmarkCollection.countDocuments({ tweetId: tweetId });
                const repliesCount = await tweetCollection.countDocuments({ parentTweetId: tweetId, type: "Reply" });
                
                await tweetCollection.updateOne({ _id: tweetId }, { $set: {
                    "stats.likes": likesCount,
                    "stats.retweets": retweetsCount,
                    "stats.bookmarks": bookmarksCount,
                    "stats.replies": repliesCount,
                } });
            }
        });

        // Reset stats for all users
        await userCollection.find({}).toArray().then(async (users) => {
            for (const user of users) {
                const userId = user._id;
                const followerCount = await followCollection.countDocuments({ following: user._id });
                const followingCount = await followCollection.countDocuments({ follower: user._id });
                const tweetsCount = await tweetCollection.countDocuments({ "author.username": user.username });

                await userCollection.updateOne({ _id: userId }, { $set: {
                    "stats.followers": followerCount,
                    "stats.following": followingCount,
                    "stats.tweetCount": tweetsCount,
                } })
            }
        });
    }

    return new Response("Tweet stats reset successfully", { status: 200 });
}