"use client";
import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Posts");
  
  const user = {
    id: "user123",
    name: "John Doe",
    username: "johndoe",
    bio: "Full-stack developer passionate about web technologies. Building cool stuff with React, Next.js, and Node.js.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    joinDate: "March 2020",
    stats: {
      following: 234,
      followers: 1567,
      tweets: 2847
    }
  };

  const userTweets = [
    {
      id: "1",
      content: "Just shipped a new feature! 🚀 The power of Next.js continues to amaze me.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      stats: { likes: 45, retweets: 12, quotes: 3, replies: 8 },
      type: "Original" as const
    },
    {
      id: "2", 
      content: "Working on improving the user experience of our platform. Small details make a big difference!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      stats: { likes: 28, retweets: 6, quotes: 1, replies: 4 },
      type: "Original" as const
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-black">{user.name}</h1>
            <p className="text-gray-600">{user.stats.tweets} posts</p>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white"></div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex justify-end mb-4">
            <button className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition-colors">
              Edit profile
            </button>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-black">{user.name}</h1>
              <p className="text-gray-500 text-black">@{user.username}</p>
            </div>

            <p className="text-gray-900">{user.bio}</p>

            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a href={user.website} className="text-pink-500 hover:underline">{user.website}</a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {user.joinDate}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6">
              <div className="flex space-x-1">
                <span className="font-semibold">{user.stats.following}</span>
                <span className="text-gray-500">Following</span>
              </div>
              <div className="flex space-x-1">
                <span className="font-semibold">{user.stats.followers}</span>
                <span className="text-gray-500">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {["Posts", "Replies", "Media", "Likes"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-1 text-center font-semibold transition-colors ${
                activeTab === tab 
                  ? "text-pink-600 border-b-2 border-pink-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* User Tweets */}
      <div className="divide-y divide-gray-200">
        {userTweets.map((tweet) => (
          <div key={tweet.id} className="p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <span className="text-gray-500">@{user.username}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500 text-sm">
                    {Math.floor((Date.now() - new Date(tweet.createdAt).getTime()) / (1000 * 60 * 60))}h
                  </span>
                </div>
                <p className="mt-1 text-gray-900">{tweet.content}</p>
                <div className="flex items-center justify-between max-w-md mt-3">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">{tweet.stats.replies}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">{tweet.stats.retweets}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{tweet.stats.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}