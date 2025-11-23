"use client";

import { useState } from "react";

interface FollowButtonProps {
  targetUsername: string;
  currentUser: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUsername,
  currentUser,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerUsername: currentUser,
          followingUsername: targetUsername,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        if (onFollowChange) {
          onFollowChange(data.isFollowing);
        }
      } else {
        console.error("Failed to toggle follow status");
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isFollowing
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {loading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}