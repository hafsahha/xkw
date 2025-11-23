"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FollowButton from "@/components/ui/FollowButton";

interface User {
  _id: string;
  username: string;
  name: string;
  bio?: string;
  media?: {
    profileImage?: string;
  };
  stats?: {
    followers: number;
    following: number;
  };
  followedAt?: string;
}

export default function FollowersFollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [activeTab, setActiveTab] = useState("followers");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    setCurrentUser(storedUser);
  }, []);

  useEffect(() => {
    if (username) {
      fetchUsers();
    }
  }, [username, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/follows?username=${username}&type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data[activeTab] || []);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{activeTab === "followers" ? "Followers" : "Following"}</h1>
              <p className="text-sm text-gray-500">@{username}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-15 md:top-0 z-10 bg-white/50 backdrop-blur border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex-1 py-4 px-1 text-center font-semibold transition-colors ${
                activeTab === "followers"
                  ? "text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-4 px-1 text-center font-semibold transition-colors ${
                activeTab === "following"
                  ? "text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No {activeTab} yet</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Link href={`/profile/${user.username}`}>
                        <Image
                          src={user.media?.profileImage ? `/img/${user.media.profileImage}` : "/img/default-avatar.png"}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                          width={48}
                          height={48}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${user.username}`} className="block">
                          <p className="font-semibold text-gray-900 hover:underline truncate">{user.name}</p>
                          <p className="text-gray-500 text-sm">@{user.username}</p>
                        </Link>
                        {user.bio && (
                          <p className="text-gray-700 text-sm mt-1 line-clamp-2">{user.bio}</p>
                        )}
                        <div className="flex space-x-4 mt-1 text-xs text-gray-500">
                          <span>{user.stats?.followers || 0} followers</span>
                          <span>{user.stats?.following || 0} following</span>
                        </div>
                      </div>
                    </div>

                    {currentUser && currentUser !== user.username && (
                      <div className="ml-3">
                        <FollowButton
                          targetUsername={user.username}
                          currentUser={currentUser}
                          initialIsFollowing={false}
                          onFollowChange={(isFollowing) => {
                            // Optional: Update local state if needed
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}