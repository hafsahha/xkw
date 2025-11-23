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

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    setCurrentUser(storedUser);
  }, []);

  useEffect(() => {
    if (username) {
      fetchFollowing();
    }
  }, [username]);

  const fetchUserIdByUsername = async (username: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/user?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        return data.user?._id || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const fetchFollowing = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/follows?username=${username}&type=following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
      } else {
        setError("Failed to fetch following");
      }
    } catch (error) {
      console.error("Error fetching following:", error);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (targetUsername: string): Promise<boolean> => {
    if (!currentUser || !targetUserId) return false;
    
    try {
      const currentUserId = await fetchUserIdByUsername(currentUser);
      const targetUserId = await fetchUserIdByUsername(targetUsername);
      
      if (!currentUserId || !targetUserId) return false;

      const response = await fetch(`/api/follows?followerId=${currentUserId}&followingId=${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        return data.isFollowing || false;
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold">Following</h1>
            </div>
          </div>
          
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold">Following</h1>
            </div>
          </div>
          
          <div className="flex justify-center p-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold">Following</h1>
              <p className="text-sm text-gray-500">@{username}</p>
            </div>
          </div>
        </div>

        {/* Following List */}
        <div className="divide-y divide-gray-200">
          {following.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Not following anyone yet</p>
            </div>
          ) : (
            following.map((user) => (
              <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Link href={`/profile/${user.username}`}>
                      <Image 
                        src={user.media?.profileImage ? `/img/${user.media.profileImage}` : '/img/default-avatar.png'} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${user.username}`} className="block">
                        <p className="font-semibold text-gray-900 hover:underline truncate">
                          {user.name}
                        </p>
                        <p className="text-gray-500 text-sm">@{user.username}</p>
                      </Link>
                      {user.bio && (
                        <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                          {user.bio}
                        </p>
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
      </div>
    </div>
  );
}