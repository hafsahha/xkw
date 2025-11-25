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

// Define types for the API data
export interface TrendingTopic {
  _id: string;
  hashtag: string;
  count: number;
}

export interface TrendingPost {
  _id: string;
  tweet: {
    _id: string;
    tweetId: string;
    content: string;
    media: string[];
    author: {
      userId: string;
      name: string;
      username: string;
      avatar: string;
    };
    stats: {
      replies: number;
      retweets: number;
      quotes: number;
      likes: number;
      bookmarks: number;
    };
    createdAt: string;
    type: string;
  };
  interactions: number;
}


export interface TrendingTopic {
  _id: string;
  hashtag: string;
  count: number;
}

// Notification system types
export interface Notification {
  _id: string;
  type: "like" | "retweet" | "follow" | "reply" | "quote" | "mention";
  recipientId: string; // User who receives the notification
  actorId: string; // User who performed the action
  actor: {
    name: string;
    username: string;
    avatar: string;
  };
  tweetId?: string; // For tweet-related notifications
  tweet?: {
    tweetId: string;
    content: string;
    media: string[];
    author: {
      name: string;
      username: string;
    };
  };
  message?: string; // Custom message for reply/quote notifications
  createdAt: string;
  read: boolean;
}