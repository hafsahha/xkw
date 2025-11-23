"use client";
import { useEffect, useState } from "react";
import { Post, User } from "@/lib/types";
import TweetComposer from "@/components/tweet/TweetComposer"; 
import TweetCard from "@/components/tweet/TweetCard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [tweets, setTweets] = useState<Post[] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setLoggedUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    async function fetchUser(username: string) {
      const response = await fetch('/api/user?username=' + username);
      const data = await response.json();
      setCurrentUser(data as User);
    }
    if(loggedUser) fetchUser(loggedUser);
  }, [loggedUser])

  const fetchFeed = async (tab: 'foryou' | 'following') => {
    const params = new URLSearchParams();
    params.set("currentUser", loggedUser!);

    if (tab === "following") {
      params.set("filter", "following"); // Ensure filtering for following tab
    }

    const response = await fetch(`/api/post?${params.toString()}`);
    const data = await response.json();

    // Filter tweets to include only those from followed users, the current user, and their retweets
    const filteredTweets = tab === "following"
      ? data.filter((tweet: Post) =>
          tweet.author.username === loggedUser ||
          currentUser?.following.includes(tweet.author.username) ||
          (tweet.type === "Retweet" && currentUser?.following.includes(tweet.parentTweetId?.author.username))
        )
      : data; // For 'For you', show all tweets

    setTweets(filteredTweets);
  }

  const handleTabSwitch = (tab: 'foryou' | 'following') => {
    setActiveTab(tab);
    fetchFeed(tab); // Fetch feed dynamically on tab switch
  };

  useEffect(() => {
    if (loggedUser) fetchFeed(activeTab); // Fetch feed for the initial tab
  }, [loggedUser, activeTab]); // Add activeTab dependency to refetch feed when tab changes

  const handleTweetPosted = () => {
    // Refresh feed setelah tweet baru diposting
    fetchFeed(activeTab);
  };

  return (
    <>
      {/* Feed Tabs */}
      <div className="sticky top-15 md:top-0 z-10 bg-white/50 backdrop-blur border-b border-gray-200">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('foryou')}
            className={`flex-1 py-4 px-1 text-center font-semibold transition-colors ${
              activeTab === 'foryou' 
              ? 'text-pink-600 border-b-2 border-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            For you
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 px-1 text-center font-semibold transition-colors ${
                activeTab === 'following' 
                ? 'text-pink-600 border-b-2 border-pink-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Tweet Composer */}
      {currentUser ? <TweetComposer user={currentUser} onTweetPosted={handleTweetPosted} /> : <TweetComposer loading />}

      {/* Tweet Feed */}
      {tweets ? (
        <div className="divide-y divide-gray-200">
          {tweets!.map((tweet, index) => (
            <TweetCard
              key={`${tweet.tweetId}-${index}`}
              tweet={tweet}
              onRetweetSuccess={() => fetchFeed(activeTab)} // Pass the correct function signature
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex space-x-2">
                    <div className="h-4 bg-gray-300 rounded w-36"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-10"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="flex w-full items-center justify-between mt-3">
                    <div className="h-4 bg-gray-300 rounded w-10"></div>
                    <div className="h-4 bg-gray-300 rounded w-10"></div>
                    <div className="h-4 bg-gray-300 rounded w-10"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
