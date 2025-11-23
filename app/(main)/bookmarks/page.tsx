"use client";

import { useEffect, useState } from "react";
import TweetCard from "@/components/tweet/TweetCard";

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
    <div className="min-h-screen bg-white">
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
            <TweetCard key={tweet._id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}

