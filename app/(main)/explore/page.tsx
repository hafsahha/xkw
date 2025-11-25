"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TweetCard from "@/components/tweet/TweetCard";
import { TrendingTopic, TrendingPost, User, Post } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"tweets" | "users" | "hashtags">("tweets");

  // Get logged user
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    setLoggedUser(storedUser);
    if (storedUser) {
      fetchCurrentUser(storedUser);
    }
  }, []);

  // Update search query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    setSearchQuery(urlQuery || "");
    if (urlQuery && loggedUser) {
      performSearch(urlQuery);
    }
  }, [searchParams, loggedUser]);

  // Fetch trending data
  useEffect(() => {
    async function fetchTrendingData() {
      try {
        const response = await fetch("/api/trending");
        if (!response.ok) {
          throw new Error("Failed to fetch trending data");
        }
        const data = await response.json();
        setTrendingTopics(data.hashtags || []);
        setTrendingPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching trending data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!query) {
      fetchTrendingData();
    }
  }, [query]);

  const fetchCurrentUser = async (username: string) => {
    try {
      const response = await fetch(`/api/user?username=${username}`);
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const performSearch = async (searchTerm: string) => {
    if (!loggedUser) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&currentUser=${loggedUser}&limit=20`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        console.log("Search results:", results);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search XKW"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </form>
        
        {/* Search Results Tabs */}
        {searchResults && (
          <div className="mt-4 space-y-3">
            <div className="flex space-x-6">
              <button 
                onClick={() => setActiveTab("tweets")}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === "tweets" 
                    ? "border-pink-500 text-pink-600 font-semibold" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Tweets ({searchResults.tweets?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab("users")}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === "users" 
                    ? "border-pink-500 text-pink-600 font-semibold" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                People ({searchResults.users?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab("hashtags")}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === "hashtags" 
                    ? "border-pink-500 text-pink-600 font-semibold" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Hashtags ({searchResults.hashtags?.length || 0})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {searchResults ? (
        /* Search Results */
        <div className="pb-4">
          {searchLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <>
              {/* Search Results Info */}
              <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                Found {searchResults.tweets?.length + searchResults.users?.length + searchResults.hashtags?.length || 0} results for "{searchResults.query}"
              </div>

              {/* Tweets Tab */}
              {activeTab === "tweets" && (
                <div className="divide-y divide-gray-200">
                  {searchResults.tweets?.length > 0 ? (
                    searchResults.tweets.map((tweet: any) => (
                      <TweetCard
                        key={tweet.tweetId}
                        tweet={{
                          ...tweet,
                          type: tweet.type as "Reply" | "Retweet" | "Quote" | "Original"
                        }}
                        user={currentUser!}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>No tweets found for "{searchResults.query}"</p>
                      <p className="text-sm mt-1">Try searching for something else.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="divide-y divide-gray-200">
                  {searchResults.users?.length > 0 ? (
                    searchResults.users.map((user: any) => (
                      <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <Link href={`/profile/${user.username}`}>
                            <Image 
                              src={`/img/${user.avatar}`} 
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                              width={48}
                              height={48}
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Link href={`/profile/${user.username}`} className="hover:underline">
                                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                </Link>
                                <p className="text-gray-500">@{user.username}</p>
                                {user.bio && (
                                  <p className="text-gray-700 mt-1 text-sm">{user.bio}</p>
                                )}
                                <p className="text-gray-500 text-sm mt-1">
                                  {user.stats.followers} followers · {user.stats.following} following
                                </p>
                              </div>
                              {!user.isCurrentUser && (
                                <button 
                                  className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                                    user.isFollowing
                                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                      : "bg-black text-white hover:bg-gray-800"
                                  }`}
                                >
                                  {user.isFollowing ? "Following" : "Follow"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>No people found for "{searchResults.query}"</p>
                      <p className="text-sm mt-1">Try searching for someone else.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Hashtags Tab */}
              {activeTab === "hashtags" && (
                <div className="divide-y divide-gray-200">
                  {searchResults.hashtags?.length > 0 ? (
                    searchResults.hashtags.map((hashtag: any, index: number) => (
                      <div 
                        key={index}
                        onClick={() => router.push(`/explore?q=${encodeURIComponent(hashtag.hashtag)}`)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900">{hashtag.hashtag}</h3>
                        <p className="text-gray-500 text-sm">{hashtag.count} tweets</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>No hashtags found for "{searchResults.query}"</p>
                      <p className="text-sm mt-1">Try searching for different hashtags.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Default Explore Content */
        <>
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
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {trendingTopics.map((trend, index) => (
                  <div
                    key={trend._id || index}
                    onClick={() => router.push(`/explore?q=${encodeURIComponent(trend.hashtag)}`)}
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
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <TweetCard
                    key={post.tweet.tweetId}
                    tweet={{
                      tweetId: post.tweet.tweetId,
                      content: post.tweet.content,
                      media: post.tweet.media,
                      author: {
                        name: post.tweet.author.name,
                        username: post.tweet.author.username,
                        avatar: post.tweet.author.avatar
                      },
                      stats: post.tweet.stats,
                      createdAt: post.tweet.createdAt,
                      type: post.tweet.type as "Reply" | "Retweet" | "Quote" | "Original",
                      isLiked: false,
                      isRetweeted: false,
                      isBookmarked: false
                    }}
                    user={currentUser!}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}