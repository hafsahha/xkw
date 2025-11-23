"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Post, User } from "@/lib/types";
import TweetCard from "@/components/tweet/TweetCard";
import Image from "next/image";
import Link from "next/link";

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

    const storedUser = localStorage.getItem("loggedUser");
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
        {userData.media.banner ?
          <Image
            src={`/img/${userData.media.banner}`} alt="Banner image"
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
            src={`/img/${userData.media.avatar ?? "default_avatar.png"}`} alt={userData.name}
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isFollowing
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
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

            {userData.bio && <p className="text-gray-900 text-sm sm:text-base">{userData.bio}</p> }
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
              <Link
                href={`/profile/${username}/followers`}
                onClick={() => setActiveTab("Followers")}
                className="flex space-x-1 hover:underline"
              >
                <span className="font-semibold">{userData.stats.followers}</span>
                <span className="text-gray-500">Followers</span>
              </Link>
              <Link
                href={`/profile/${username}/followers`}
                onClick={() => setActiveTab("Following")}
                className="flex space-x-1 hover:underline"
              >
                <span className="font-semibold">{userData.stats.following}</span>
                <span className="text-gray-500">Following</span>
              </Link>
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
          {userPosts!.map((tweet, _) => <TweetCard key={_} tweet={tweet} onRetweetSuccess={fetchPosts} />)}
        </div>
      )}
    </div>
  );
}
