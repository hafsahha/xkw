"use client";

import { TrendingTopic } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SuggestedUser {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  media?: {
    avatar: string;
    banner: string;
  };
  stats: {
    followers: number;
    following: number;
    tweetCount: number;
  };
  isFollowing: boolean;
}

export default function RightSidebar() {
  const router = useRouter();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current user from localStorage (you might have a different way to get this)
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      // Try to get from localStorage, if not available, check if there are any users in your DB
      const stored = localStorage.getItem('currentUser');
      if (stored) return stored;
      
      // For now, let's use a test user - you might want to get this from auth context
      return 'test_user';
    }
    return 'test_user';
  };

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

    // Fetch suggested users
    async function fetchSuggestedUsers() {
      try {
        const currentUser = getCurrentUser();
        console.log("Fetching suggestions for user:", currentUser);
        
        const response = await fetch(`/api/user?suggestions=true&currentUser=${currentUser}&limit=3`);
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`Failed to fetch suggested users: ${response.status} ${errorText}`);
        }
        
        const users = await response.json();
        console.log("Fetched users:", users);
        setSuggestedUsers(users);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        // Fallback to empty array on error
        setSuggestedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchTrendingTopics();
    fetchSuggestedUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle follow/unfollow functionality
  const handleFollow = async (userId: string, username: string) => {
    try {
      const currentUser = getCurrentUser();
      console.log('Following user:', { currentUser, username });
      
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerUsername: currentUser,
          followingUsername: username
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Follow response:', data);
        
        // Update the local state to reflect the follow status change
        setSuggestedUsers(prev => 
          prev.map(user => 
            user._id === userId 
              ? { ...user, isFollowing: data.isFollowing }
              : user
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Follow API error:', errorData);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

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
      </div>

      {/* Suggested Users */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h3 className="text-xl font-bold mb-4 text-black">Who to follow</h3>
        {loadingUsers ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-300 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedUsers.length > 0 ? (
              suggestedUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button 
                      onClick={() => router.push(`/profile/${user.username}`)}
                      className="flex-shrink-0"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                        {user.media?.avatar && user.media.avatar !== 'default_avatar.png' ? (
                          <img 
                            src={`/img/${user.media.avatar}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<span class="text-gray-600 text-sm font-semibold">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <button 
                        onClick={() => router.push(`/profile/${user.username}`)}
                        className="block text-left w-full"
                      >
                        <p className="font-semibold text-sm text-black hover:underline truncate">{user.name}</p>
                        <p className="text-gray-500 text-sm">@{user.username}</p>
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFollow(user._id, user.username)}
                    className={`ml-3 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      user.isFollowing 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                No new users to suggest
              </div>
            )}
          </div>
        )}
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