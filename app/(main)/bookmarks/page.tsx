"use client";

import { useEffect, useState } from "react";

// Define the type for a tweet
interface Tweet {
  _id: string;
  author: {
    name: string;
    username: string;
  };
  createdAt: string;
  content: string;
  stats: {
    replies: number;
    retweets: number;
    likes: number;
  };
}

export default function BookmarksPage() {
  const [bookmarkedTweets, setBookmarkedTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the logged-in user's username from localStorage
    const storedUser = localStorage.getItem("loggedUser");
    setCurrentUser(storedUser);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchBookmarks = async () => {
      try {
        const response = await fetch(`/api/bookmarks?username=${currentUser}`);
        if (response.ok) {
          const data = await response.json();
          setBookmarkedTweets(data);
        } else {
          console.error("Failed to fetch bookmarks");
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [currentUser]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-black">Bookmarks</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">@{currentUser}</p>
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
            <article key={tweet._id} className="p-4 hover:bg-gray-50/50 transition-colors">
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
    </>
  );
}