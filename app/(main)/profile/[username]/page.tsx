"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { User } from "@/lib/types";
import Image from "next/image";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [userData, setUserData] = useState<User | null>(null);
  const [isMyself, setIsMyself] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const { username } = React.use(params);

  useEffect(() => {
    async function fetchUserData() {
      const response = await fetch('/api/user?username=' + username);
      const data = await response.json();
      setUserData(data as User);
    }
    fetchUserData();
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setIsMyself(storedUser === username), 0);
    return () => clearTimeout(t);
  }, [username]);

  if (!userData) {
    return (
      <div className="p-4 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>
    )
  }
  
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

  interface Tweet {
    id: string;
    content: string;
    createdAt: string;
    stats: {
      likes: number;
      retweets: number;
      quotes: number;
      replies: number;
    };
    type: "Original" | "Reply" | "Media" | "Liked";
    mediaUrl?: string;
    parentTweet?: {
      id: string;
      content: string;
      author: string;
      username: string;
    };
  }

  const userTweets: Tweet[] = [
    {
      id: "1",
      content: "Just shipped a new feature! 🚀 The power of Next.js continues to amaze me.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      stats: { likes: 45, retweets: 12, quotes: 3, replies: 8 },
      type: "Original"
    },
    {
      id: "2",
      content: "Working on improving the user experience of our platform. Small details make a big difference!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      stats: { likes: 28, retweets: 6, quotes: 1, replies: 4 },
      type: "Original"
    }
  ];

  const userReplies: Tweet[] = [
    {
      id: "3",
      content: "I totally agree with this! Great insight.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      stats: { likes: 10, retweets: 2, quotes: 0, replies: 1 },
      type: "Reply",
      parentTweet: {
        id: "parent1",
        content: "React 18 concurrent features are game-changing for UX!",
        author: "Tech Expert",
        username: "techexpert"
      }
    },
    {
      id: "4",
      content: "Thanks for sharing this! Really helpful.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      stats: { likes: 5, retweets: 1, quotes: 0, replies: 0 },
      type: "Reply",
      parentTweet: {
        id: "parent2",
        content: "Best practices for Next.js performance optimization",
        author: "Dev Guide",
        username: "devguide"
      }
    }
  ];

  const userMedia: Tweet[] = [
    {
      id: "5",
      content: "Check out my latest project screenshot!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      stats: { likes: 50, retweets: 15, quotes: 5, replies: 10 },
      type: "Media",
      mediaUrl: "placeholder"
    },
    {
      id: "6",
      content: "UI design progress",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      stats: { likes: 32, retweets: 8, quotes: 2, replies: 6 },
      type: "Media",
      mediaUrl: "placeholder"
    },
    {
      id: "7",
      content: "New feature demo",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      stats: { likes: 28, retweets: 12, quotes: 3, replies: 4 },
      type: "Media",
      mediaUrl: "placeholder"
    },
    {
      id: "8",
      content: "Code review session",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      stats: { likes: 19, retweets: 5, quotes: 1, replies: 2 },
      type: "Media",
      mediaUrl: "placeholder"
    },
    {
      id: "9",
      content: "Team meeting highlights",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      stats: { likes: 15, retweets: 3, quotes: 0, replies: 1 },
      type: "Media",
      mediaUrl: "placeholder"
    }
  ];

  const userLikes: Tweet[] = [
    {
      id: "10",
      content: "This is an amazing post about web development trends!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      stats: { likes: 100, retweets: 20, quotes: 10, replies: 15 },
      type: "Liked"
    },
    {
      id: "11",
      content: "Great insights on React performance optimization techniques.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      stats: { likes: 85, retweets: 25, quotes: 8, replies: 12 },
      type: "Liked"
    }
  ];

  const getActiveTabData = () => {
    switch (activeTab) {
      case "Replies":
        return userReplies;
      case "Media":
        return userMedia;
      case "Likes":
        return userLikes;
      default:
        return userTweets;
    }
  };

  const TweetActions = ({ stats, isLiked = false }: { stats: { likes: number; retweets: number; quotes: number; replies: number }, isLiked?: boolean }) => (
    <div className="flex items-center justify-between max-w-md mt-3">
      {/* Reply */}
      <button className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-blue-600 transition-colors group">
        <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm">{stats.replies}</span>
      </button>
      
      {/* Retweet */}
      <button className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-green-600 transition-colors group">
        <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-green-50">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm">{stats.retweets}</span>
      </button>
      
      {/* Like */}
      <button className={`flex items-center space-x-1 sm:space-x-2 transition-colors group ${
        isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
      }`}>
        <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-red-50">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm">{stats.likes}</span>
      </button>
      
      {/* Share */}
      <button className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-blue-600 transition-colors group">
        <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </div>
      </button>
      
      {/* Bookmark */}
      <button className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-blue-600 transition-colors group">
        <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
      </button>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 px-4 py-1 bg-white/50 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-black">{userData.name}</h1>
            <p className="text-gray-600 text-sm">{userData.stats.tweetCount} posts</p>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        {userData.media.bannerImage ?
          <Image
            src={`/img/${userData.media.bannerImage}`} alt="Cover Photo"
            width={1000} height={300}
            className="h-56 w-full object-cover"
          />
        :
          <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        }
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          {/* Avatar */}
          <Image
            src={`/img/${userData.media.profileImage}`} alt="Profile Avatar"
            className="relative -mt-20 mb-4 w-40 h-40 bg-gray-300 rounded-full border-4 border-white"
            width={160} height={160}
          />

          {/* Edit Profile Button */}
          <div className="relative -mt-20 flex justify-end mb-10">
            {isMyself ? (
              <button 
                onClick={() => window.location.href = '/profile/edit'}
                className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <button 
                onClick={() => alert('Follow/unfollow functionality not implemented yet.')}
                className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                Follow
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-black">{userData.name}</h1>
              <p className="text-gray-500 text-black">@{userData.username}</p>
            </div>

            <p className="text-gray-900 text-sm sm:text-base">{userData.bio}</p>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6">
              <div className="flex space-x-1">
                <span className="font-semibold">{userData.stats.following}</span>
                <span className="text-gray-500">Following</span>
              </div>
              <div className="flex space-x-1">
                <span className="font-semibold">{userData.stats.followers}</span>
                <span className="text-gray-500">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          {["Posts", "Replies", "Media", "Likes"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-4 text-center font-semibold transition-colors min-w-0 ${
                activeTab === tab 
                  ? "text-pink-600 border-b-2 border-pink-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="whitespace-nowrap">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {activeTab === "Media" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 p-4">
            {getActiveTabData().map((media) => (
              <div key={media.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "Replies" ? (
          getActiveTabData().map((reply) => (
            <div key={reply.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              {/* Parent Tweet */}
              {reply.parentTweet && (
                <div className="mb-3">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <h3 className="font-semibold text-gray-900">{reply.parentTweet.author}</h3>
                        <span className="text-gray-500">@{reply.parentTweet.username}</span>
                      </div>
                      <p className="mt-1 text-gray-900">{reply.parentTweet.content}</p>
                    </div>
                  </div>
                  {/* Connection Line */}
                  <div className="ml-5 w-0.5 h-4 bg-gray-300"></div>
                </div>
              )}
              
              {/* Reply Tweet */}
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <span className="text-gray-500">@{user.username}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">
                      {Math.floor((Date.now() - new Date(reply.createdAt).getTime()) / (1000 * 60 * 60))}h
                    </span>
                  </div>
                  <p className="mt-1 text-gray-900">{reply.content}</p>
                  <TweetActions stats={reply.stats} />
                </div>
              </div>
            </div>
          ))
        ) : activeTab === "Likes" ? (
          getActiveTabData().map((likedPost) => (
            <div key={likedPost.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-gray-900">Original Author</h3>
                    <span className="text-gray-500">@originalauthor</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">
                      {Math.floor((Date.now() - new Date(likedPost.createdAt).getTime()) / (1000 * 60 * 60))}h
                    </span>
                  </div>
                  <p className="mt-1 text-gray-900">{likedPost.content}</p>
                  <TweetActions stats={likedPost.stats} isLiked={true} />
                </div>
              </div>
            </div>
          ))
        ) : (
          getActiveTabData().map((tweet) => (
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
                  <TweetActions stats={tweet.stats} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}