export interface UserStats {
    followers: number;
    following: number;
    tweetCount: number;
}

export interface User {
    userId: string;
    username: string;
    email: string;
    password: string;
    name: string;
    bio: string;
    media: {
        profileImage: string;
        bannerImage: string;
    };
    stats: UserStats;
    createdAt: string;
}

export interface PostStats {
    replies: number;
    retweets: number;
    quotes: number;
    likes: number;
}

export interface Post {
    tweetId: string;
    author: User;
    content: string;
    media: string[];
    parentTweetId: Post | null;
    type: "Reply" | "Retweet" | "Quote" | "Original";
    stats: PostStats;
    createdAt: string;
}