"use client";
import { useEffect, useState } from "react";
import TweetComposer from "@/components/tweet/TweetComposer";
import TweetFeed from "@/components/tweet/TweetFeed";
import { Post, User } from "@/lib/types";

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
    async function fetchUser(userId: string) {
      const response = await fetch('/api/user?id=' + userId);
      const data = await response.json();
      setCurrentUser(data as User);
    }
    if(loggedUser) fetchUser(loggedUser);
  }, [loggedUser])

  useEffect(() => {
    async function fetchFeed() {
      const response = await fetch('/api/post');
      const data = await response.json();
      setTweets(data as Post[]);
    }
    fetchFeed();
  }, [])

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
      {currentUser ? <TweetComposer user={currentUser} /> : <TweetComposer loading />}

      {/* Tweet Feed */}
      {tweets ? <TweetFeed tweets={tweets} /> : <TweetFeed loading />}
    </>
  );
}
