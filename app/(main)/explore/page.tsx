export default function ExplorePage() {
  const trendingTopics = [
    { rank: 1, topic: "#WebDevelopment", posts: "45.2K posts", category: "Technology" },
    { rank: 2, topic: "#NextJS", posts: "23.1K posts", category: "Programming" },
    { rank: 3, topic: "#MongoDB", posts: "18.7K posts", category: "Database" },
    { rank: 4, topic: "#React", posts: "156K posts", category: "Framework" },
    { rank: 5, topic: "#JavaScript", posts: "287K posts", category: "Programming" },
    { rank: 6, topic: "#TypeScript", posts: "89.3K posts", category: "Programming" },
    { rank: 7, topic: "#TailwindCSS", posts: "67.8K posts", category: "CSS" },
    { rank: 8, topic: "#NodeJS", posts: "234K posts", category: "Backend" },
  ];

  const categories = [
    "For you",
    "Trending", 
    "Technology",
    "Programming",
    "Design",
    "Business",
    "Sports",
    "Entertainment"
  ];

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-black">Explore</h1>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search XKW"
            className="w-full bg-gray-100 rounded-full py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all placeholder:text-black"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`flex-shrink-0 py-4 px-4 font-semibold transition-colors whitespace-nowrap ${
                index === 0 
                  ? 'text-pink-600 border-b-2 border-pink-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-black">Trending for you</h2>
        <div className="space-y-1">
          {trendingTopics.map((trend) => (
            <div key={trend.rank} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {trend.rank} · Trending in {trend.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mt-1 break-words text-black">{trend.topic}</h3>
                  <p className="text-sm text-gray-500 mt-1">{trend.posts}</p>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Section */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-black">What's happening</h2>
        <div className="space-y-4">
          <div className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Technology · Trending</p>
              <h3 className="font-semibold text-sm mt-1 line-clamp-2 text-black">
                New JavaScript features coming in 2024 that will change how we code
              </h3>
              <p className="text-sm text-gray-500 mt-1">Trending with #JavaScript, #WebDev</p>
            </div>
          </div>

          <div className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Business · 2 hours ago</p>
              <h3 className="font-semibold text-sm mt-1 line-clamp-2 text-black">
                Major tech companies announce new remote work policies for 2024
              </h3>
              <p className="text-sm text-gray-500 mt-1">12.3K posts</p>
            </div>
          </div>

          <div className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Technology · Trending</p>
              <h3 className="font-semibold text-sm mt-1 line-clamp-2 text-black">
                AI breakthrough: New model achieves human-level performance
              </h3>
              <p className="text-sm text-gray-500 mt-1">Trending with #AI, #Technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Follows */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-black">Who to follow</h2>
        <div className="space-y-4">
          {[
            { name: "React", username: "reactjs", description: "A JavaScript library for building user interfaces" },
            { name: "Next.js", username: "nextjs", description: "The React Framework for Production" },
            { name: "Vercel", username: "vercel", description: "Develop. Preview. Ship. For the best frontend teams." }
          ].map((account) => (
            <div key={account.username} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-black">{account.name}</h3>
                  <p className="text-sm text-gray-500 truncate text-black">@{account.username}</p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{account.description}</p>
                </div>
              </div>
              <button className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors flex-shrink-0 ml-3">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}