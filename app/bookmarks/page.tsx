import MainLayout from "@/components/layout/MainLayout";

export default function BookmarksPage() {
  // Mock bookmarked tweets data
  const bookmarkedTweets = [
    {
      id: "1",
      author: {
        id: "user1",
        username: "techguru",
        name: "Tech Guru",
        avatar: "/placeholder-avatar.png"
      },
      content: "10 JavaScript tips that will make you a better developer:\n\n1. Use destructuring for cleaner code\n2. Master async/await\n3. Understand closures\n4. Learn functional programming concepts\n\nThread below 👇",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      stats: {
        likes: 324,
        retweets: 89,
        quotes: 23,
        replies: 45
      },
      type: "Original" as const,
      bookmarkedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      id: "2",
      author: {
        id: "user2",
        username: "designpro",
        name: "Design Pro",
        avatar: "/placeholder-avatar.png"
      },
      content: "The psychology of color in UI design:\n\n🔴 Red: Urgency, action\n🔵 Blue: Trust, calm\n🟢 Green: Success, growth\n🟡 Yellow: Attention, caution\n🟣 Purple: Luxury, creativity\n\nChoose wisely for your next project!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      stats: {
        likes: 567,
        retweets: 234,
        quotes: 67,
        replies: 89
      },
      type: "Original" as const,
      bookmarkedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: "3",
      author: {
        id: "user3",
        username: "webdevtips",
        name: "WebDev Tips",
        avatar: "/placeholder-avatar.png"
      },
      content: "CSS Grid vs Flexbox - when to use which?\n\n📊 CSS Grid: For 2D layouts (rows AND columns)\n📐 Flexbox: For 1D layouts (either rows OR columns)\n\nGrid for page layout, Flexbox for components. That's the general rule!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      stats: {
        likes: 445,
        retweets: 178,
        quotes: 34,
        replies: 67
      },
      type: "Original" as const,
      bookmarkedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
    },
    {
      id: "4",
      author: {
        id: "user4",
        username: "reactdev",
        name: "React Developer",
        avatar: "/placeholder-avatar.png"
      },
      content: "React 19 is here! 🎉\n\nKey new features:\n- React Server Components\n- Concurrent features\n- Automatic batching\n- New Suspense improvements\n\nTime to upgrade your projects!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      stats: {
        likes: 892,
        retweets: 456,
        quotes: 123,
        replies: 234
      },
      type: "Original" as const,
      bookmarkedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
    }
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-black">Bookmarks</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">@username</p>
      </div>

      {/* Empty State or Bookmarks */}
      {bookmarkedTweets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Save posts for later</h2>
          <p className="text-gray-500 max-w-sm">
            Bookmark posts to easily find them again in the future. 
            Tap the bookmark icon on any post to add it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {bookmarkedTweets.map((tweet) => (
            <article key={tweet.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center space-x-1 mb-1">
                    <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                      {tweet.author.name}
                    </h3>
                    <span className="text-gray-500">@{tweet.author.username}</span>
                    <span className="text-gray-500">·</span>
                    <time className="text-gray-500 text-sm">
                      {formatTime(tweet.createdAt)}
                    </time>
                  </div>

                  {/* Tweet Content */}
                  <div className="mb-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{tweet.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between max-w-md">
                    {/* Reply */}
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      {tweet.stats.replies > 0 && (
                        <span className="text-sm">{formatNumber(tweet.stats.replies)}</span>
                      )}
                    </button>

                    {/* Retweet */}
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      {tweet.stats.retweets > 0 && (
                        <span className="text-sm">{formatNumber(tweet.stats.retweets)}</span>
                      )}
                    </button>

                    {/* Like */}
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      {tweet.stats.likes > 0 && (
                        <span className="text-sm">{formatNumber(tweet.stats.likes)}</span>
                      )}
                    </button>

                    {/* Bookmark (filled since it's bookmarked) */}
                    <button className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <svg className="h-4 w-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                    </button>

                    {/* Share */}
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </MainLayout>
  );
}