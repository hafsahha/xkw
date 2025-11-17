import TweetCard from "./TweetCard";

// Mock data for development
const mockTweets = [
  {
    id: "1",
    author: {
      id: "user1",
      username: "johndev",
      name: "John Developer",
      avatar: "/placeholder-avatar.png"
    },
    content: "Just shipped a new feature using Next.js 14! The app directory is a game changer for building modern web applications. 🚀",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    stats: {
      likes: 24,
      retweets: 8,
      quotes: 2,
      replies: 5
    },
    type: "Original" as const
  },
  {
    id: "2",
    author: {
      id: "user2",
      username: "sarahdesign",
      name: "Sarah Designer",
      avatar: "/placeholder-avatar.png"
    },
    content: "Working on a new design system. The key is consistency across all components while maintaining flexibility for different use cases.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    stats: {
      likes: 156,
      retweets: 43,
      quotes: 12,
      replies: 28
    },
    type: "Original" as const
  },
  {
    id: "3",
    author: {
      id: "user3",
      username: "technews",
      name: "Tech News",
      avatar: "/placeholder-avatar.png"
    },
    content: "MongoDB 7.0 introduces new features for better performance and developer experience. Time to upgrade your database! What's your experience with NoSQL databases?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    stats: {
      likes: 89,
      retweets: 67,
      quotes: 23,
      replies: 45
    },
    type: "Original" as const
  },
  {
    id: "4",
    author: {
      id: "user4",
      username: "webdev",
      name: "Web Developer",
      avatar: "/placeholder-avatar.png"
    },
    content: "Hot take: TypeScript has become essential for large-scale JavaScript projects. The type safety and developer experience improvements are worth the initial learning curve.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    stats: {
      likes: 234,
      retweets: 89,
      quotes: 34,
      replies: 67
    },
    type: "Original" as const
  },
  {
    id: "5",
    author: {
      id: "user5",
      username: "startuplife",
      name: "Startup Life",
      avatar: "/placeholder-avatar.png"
    },
    content: "Building a startup is like solving a puzzle where the pieces keep changing shape. Adaptability is everything! 💪",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    stats: {
      likes: 78,
      retweets: 23,
      quotes: 8,
      replies: 15
    },
    type: "Original" as const
  }
];

interface TweetFeedProps {
  tweets?: typeof mockTweets;
  loading?: boolean;
}

export default function TweetFeed({ tweets = mockTweets, loading = false }: TweetFeedProps) {
  if (loading) {
    return (
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="flex space-x-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="flex space-x-8 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-300 rounded w-8"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}