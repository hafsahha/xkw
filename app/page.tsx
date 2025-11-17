"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TweetComposer from "@/components/tweet/TweetComposer";
import TweetFeed from "@/components/tweet/TweetFeed";

// Mock data for Following feed
const followingTweets = [
  {
    id: "f1",
    author: {
      id: "user1",
      username: "johndev",
      name: "John Developer",
      avatar: "/placeholder-avatar.png"
    },
    content: "Working on a new React component library. Clean, reusable components are the foundation of great apps! 🚀",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    stats: { likes: 12, retweets: 3, quotes: 1, replies: 2 },
    type: "Original" as const
  },
  {
    id: "f2",
    author: {
      id: "user2",
      username: "sarahdesign",
      name: "Sarah Designer",
      avatar: "/placeholder-avatar.png"
    },
    content: "Just finished designing a new mobile app interface. The key is balancing aesthetics with usability.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    stats: { likes: 28, retweets: 8, quotes: 2, replies: 5 },
    type: "Original" as const
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10" suppressHydrationWarning>
        <div className="flex items-center justify-between" suppressHydrationWarning>
          <h1 className="text-xl font-bold text-black">Home</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tweet Composer */}
      <TweetComposer />

      {/* Feed Tabs */}
      <div className="border-b border-gray-200">
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

      {/* Tweet Feed */}
      {activeTab === 'foryou' ? (
        <TweetFeed />
      ) : (
        <TweetFeed tweets={followingTweets} />
      )}
    </MainLayout>
  );
}
