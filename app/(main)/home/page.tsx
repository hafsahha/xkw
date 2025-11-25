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

  const fetchFeed = async (tab: 'foryou' | 'following') => {
    try {
      console.log("[DEBUG] fetchFeed called - loggedUser:", loggedUser, "tab:", tab);
      const params = new URLSearchParams();
      if (loggedUser) params.set("currentUser", loggedUser);
      if (tab === "following") params.set("filter", "following");

      const url = `/api/post?${params.toString()}`;
      console.log("[DEBUG] Fetching from:", url);

      const response = await fetch(url);
      if (!response.ok) {
        console.error("[ERROR] Failed to fetch feed - Status:", response.status, "URL:", url);
        setTweets([]);
        return;
      }
      
      const data = await response.json();
      console.log("[DEBUG] Feed data received, tweets count:", data?.length);

      // Filter tweets to include only those from followed users, the current user, and their retweets
      const filteredTweets = tab === "following"
        ? data.filter((tweet: Post) =>
            tweet.author.username === loggedUser ||
            currentUser?.following.includes(tweet.author.username) ||
            (tweet.type === "Retweet" && currentUser?.following.includes(tweet.author.username))
          )
        : data; // For 'For you', show all tweets

      console.log("[DEBUG] Filtered tweets count:", filteredTweets?.length);
      setTweets(filteredTweets as Post[]);
    } catch (error) {
      console.error("[ERROR] Error fetching feed:", error);
      setTweets([]);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    console.log("[DEBUG] useEffect 1 - Stored user from localStorage:", storedUser);
    const t = setTimeout(() => setLoggedUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    async function fetchUser(username: string) {
      try {
        console.log("[DEBUG] Fetching user:", username);
        const response = await fetch(`/api/user?username=${username}`);
        if (!response.ok) {
          console.error("[ERROR] Failed to fetch user - Status:", response.status, "Username:", username);
          return;
        }
        const data = await response.json();
        console.log("[DEBUG] User fetched successfully:", data?.username, "ID:", data?._id);
        setCurrentUser(data as User);
      } catch (error) {
        console.error("[ERROR] Error fetching user:", error);
      }
    }

    async function fetchFeedOnUserLoad() {
      try {
        console.log("[DEBUG] Fetching initial feed - loggedUser:", loggedUser);
        const url = `/api/post?currentUser=${loggedUser}`;
        console.log("[DEBUG] Initial feed URL:", url);
        
        const response = await fetch(url);
        if (!response.ok) {
          console.error("[ERROR] Failed to fetch initial feed - Status:", response.status, "URL:", url);
          setTweets([]);
          return;
        }
        const data = await response.json();
        console.log("[DEBUG] Initial feed fetched, tweets count:", data?.length);
        setTweets(data as Post[]);
      } catch (error) {
        console.error("[ERROR] Error fetching initial feed:", error);
        setTweets([]);
      }
    }
    
    if (loggedUser) {
      console.log("[DEBUG] useEffect 2 - loggedUser changed to:", loggedUser);
      fetchUser(loggedUser); 
      fetchFeedOnUserLoad(); 
    } else {
      console.log("[DEBUG] useEffect 2 - loggedUser is null/empty, skipping fetch");
    }
  }, [loggedUser])

  return (
    <>
      {/* Feed Tabs */}
      <div className="sticky top-15 md:top-0 z-10 bg-white/50 backdrop-blur border-b border-gray-200">
        <div className="flex">
          <button 
            onClick={() => { setActiveTab('foryou'); fetchFeed('foryou'); }}
            className={`flex-1 py-4 px-1 text-center font-semibold transition-colors ${
              activeTab === 'foryou' 
              ? 'text-pink-600 border-b-2 border-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            For you
          </button>
          <button 
            onClick={() => { setActiveTab('following'); fetchFeed('following'); }}
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
      {currentUser ? <TweetComposer user={currentUser} onTweetPosted={() => fetchFeed(activeTab)} /> : <TweetComposer loading />}

      {/* Tweet Feed */}
      {tweets ? (
        <div className="">
          {tweets.length > 0 ? (
            tweets.map((tweet, index) => (
              <TweetCard
                key={`${tweet.tweetId}-${index}`}
                tweet={tweet}
                onRetweetSuccess={() => fetchFeed(activeTab)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tweets yet. Be the first to tweet!
            </div>
          )}
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
