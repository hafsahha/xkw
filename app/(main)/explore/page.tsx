"use client";

import { useEffect, useState } from "react";
import TweetCard from "@/components/tweet/TweetCard"; // Import TweetCard component

export default function ExplorePage() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the /api/trending route
    async function fetchTrendingData() {
      try {
        const response = await fetch("/api/trending");
        if (!response.ok) {
          throw new Error("Failed to fetch trending data");
        }
        const data = await response.json();
        setTrendingTopics(data.hashtags || []); // Set hashtags from API response
        setTrendingPosts(data.posts || []); // Set trending posts from API response
      } catch (error) {
        console.error("Error fetching trending data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingData();
  }, []);

  const categories = [
    "For you",
    "Trending",
    "Technology",
    "Programming",
    "Design",
    "Business",
    "Sports",
    "Entertainment",
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
            <svg
              className="h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
                  ? "text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-500 hover:text-gray-700"
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
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-1">
            {trendingTopics.map((trend, index) => (
              <div
                key={trend._id || index}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {index + 1} · Trending
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mt-1 break-words text-black">
                      {trend.hashtag}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {trend.count} mentions
                    </p>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 ml-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Posts Section */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-black">Trending Posts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <TweetCard
                key={post.tweet.tweetId}
                tweet={{
                  tweetId: post.tweet.tweetId,
                  content: post.tweet.content,
                  media: post.tweet.media,
                  author: post.tweet.author,
                  stats: post.tweet.stats,
                  createdAt: post.tweet.createdAt,
                  type: post.tweet.type,
                }}
                user={post.tweet.author} // Pass the author as the user
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}