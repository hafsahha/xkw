export interface UserStats {
    followers: number;
    following: number;
    tweetCount: number;
}

export interface User {
    username: string;
    email: string;
    password: string;
    name: string;
    bio?: string;
    location?: string;
    website?: string;
    media: {
        avatar?: string;
        banner?: string;
    };
    stats: UserStats;
    createdAt: string;
    followers: string[];
    following: string[];
}

export interface PostStats {
    replies: number;
    retweets: number;
    quotes: number;
    likes: number;
}

export interface Post {
    author: {
        name: string;
        username: string;
        avatar: string;
    };
    content: string;
    media: string[];
    type: "Reply" | "Retweet" | "Quote" | "Original";
    stats: PostStats;
    createdAt: string;
    tweetId: string;
    isLiked: boolean;
    isRetweeted: boolean;
    isBookmarked: boolean;
    replies?: Post[];
}