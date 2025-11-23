"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Post, User } from "@/lib/types";
import TweetCard from "@/components/tweet/TweetCard";
import Image from "next/image";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Post[] | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isMyself, setIsMyself] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const { username } = React.use(params);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ username: String(username) });
      if (currentUser) params.set("currentUser", currentUser);

      if (activeTab === "Replies") params.set("includeReplies", "true");
      else if (activeTab === "Media") params.set("mediaOnly", "true");
      else if (activeTab === "Likes") params.set("likedOnly", "true");

      const res = await fetch(`/api/post?${params.toString()}`);
      const data = await res.json();
      setUserPosts(data as Post[]);
    } catch { setUserPosts([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (currentUser) fetchPosts();
  }, [activeTab, username, currentUser]);

  useEffect(() => {
    async function fetchUserData() {
      const response = await fetch(`/api/user?username=${username}`);
      const data = await response.json();
      setUserData(data as User);
    }
    
    const storedUser = localStorage.getItem('loggedUser')
    if (!storedUser) return;
    const t = setTimeout(() => {
      setIsMyself(storedUser === username);
      setCurrentUser(storedUser);
    }, 0);

    fetchUserData();
    return () => clearTimeout(t);
  }, [username]);

  useEffect(() => {
    const checkFollowingStatus = () => {
      const loggedInUsername = currentUser;
      if (!loggedInUsername || !userData) return false;
      return userData.followers.includes(loggedInUsername);
    };

    setIsFollowing(checkFollowingStatus());
  }, [userData, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      return alert("You must be logged in to follow users.");
    }

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower: currentUser,
          followee: userData?.username,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsFollowing((prev) => !prev);
        alert(result.message);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (!userData) {
    return (
      <div className="p-4 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
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
                onClick={handleFollowToggle}
                className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                {isFollowing ? "Unfollow" : "Follow"}
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
      {loading ? (
        <div className="min-h-screen divide-y divide-gray-200">
          <Loader2 className="h-6 w-6 mx-auto my-10 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="min-h-screen divide-y divide-gray-200">
          {userPosts!.map((tweet) => <TweetCard key={tweet.tweetId} tweet={tweet} onRetweetSuccess={fetchPosts} />)}
        </div>
      )}
    </div>
  );
}

{/* {activeTab === "Media" ? (
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
            <div key={reply.id} className="p-4 hover:bg-gray-50/50 transition-colors"> */}
              {/* Parent Tweet */}
              {/* {reply.parentTweet && (
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
                  </div> */}
                  {/* Connection Line */}
                  {/* <div className="ml-5 w-0.5 h-4 bg-gray-300"></div>
                </div>
              )} */}
              
              {/* Reply Tweet */}
              {/* <div className="flex space-x-3">
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
        ) : null } */}