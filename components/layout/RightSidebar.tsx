"use client";

import { TrendingTopic } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RightSidebar() {
  const router = useRouter();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch data from the /api/trending route
    async function fetchTrendingTopics() {
      try {
        const response = await fetch("/api/trending");
        if (!response.ok) {
          throw new Error("Failed to fetch trending topics");
        }
        const data = await response.json();
        setTrendingTopics(data.hashtags || []); // Set hashtags from API response
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingTopics();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const suggestedUsers = [
    {
      id: 1,
      name: "John Developer",
      username: "@johndev",
      avatar: "/placeholder-avatar.png",
      isFollowing: false,
    },
    {
      id: 2,
      name: "Sarah Designer",
      username: "@sarahdesign",
      avatar: "/placeholder-avatar.png",
      isFollowing: false,
    },
    {
      id: 3,
      name: "Tech News",
      username: "@technews",
      avatar: "/placeholder-avatar.png",
      isFollowing: false,
    },
  ];

  return (
    <div className="w-80 hidden lg:block p-4 space-y-6">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white pb-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search XKW"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-full py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors placeholder-gray-600"
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
        </form>
      </div>

      {/* Trending Topics */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h3 className="text-xl font-bold mb-4 text-black">What's happening</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {trendingTopics.map((trend, index) => (
              <div
                key={trend._id || index}
                onClick={() => router.push(`/explore?q=${encodeURIComponent(trend.hashtag)}`)}
                className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <div className="text-gray-500 text-sm">Trending in Technology</div>
                <div className="font-semibold text-black">{trend.hashtag}</div>
                <div className="text-gray-500 text-sm">{trend.count} mentions</div>
              </div>
            ))}
          </div>
        )}
        <button className="text-blue-500 hover:underline mt-3 text-sm">
          Show more
        </button>
      </div>

      {/* Suggested Users */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h3 className="text-xl font-bold mb-4 text-black">Who to follow</h3>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-semibold text-sm text-black">{user.name}</div>
                  <div className="text-gray-500 text-sm">{user.username}</div>
                </div>
              </div>
              <button className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
        <button className="text-pink-500 hover:underline mt-3 text-sm">
          Show more
        </button>
      </div>

      {/* Footer Links */}
      <div className="text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Cookie Policy
          </a>
          <a href="#" className="hover:underline">
            Accessibility
          </a>
          <a href="#" className="hover:underline">
            Ads info
          </a>
          <a href="#" className="hover:underline">
            More
          </a>
        </div>
        <div>© 2024 XKW Corp.</div>
      </div>
    </div>
  );
}