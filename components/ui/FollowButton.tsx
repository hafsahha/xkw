"use client";
import { useState, useEffect } from "react";

interface FollowButtonProps {
  targetUsername: string;
  currentUser: string | null;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ 
  targetUsername, 
  currentUser, 
  initialIsFollowing = false,
  onFollowChange 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollow = async () => {
    if (!currentUser || isLoading) return;
    
    setIsLoading(true);
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);

    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerUsername: currentUser,
          followingUsername: targetUsername
        })
      });

      if (response.ok) {
        const result = await response.json();
        setIsFollowing(result.isFollowing);
        if (onFollowChange) {
          onFollowChange(result.isFollowing);
        }
      } else {
        // Revert on error
        setIsFollowing(!newFollowState);
        console.error("Failed to toggle follow");
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(!newFollowState);
      console.error("Follow error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (currentUser === targetUsername) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
        isFollowing
          ? 'bg-gray-200 hover:bg-red-500 hover:text-white text-gray-800 border border-gray-300'
          : 'bg-black text-white hover:bg-gray-800'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} group`}
    >
      <span className={isFollowing ? 'group-hover:hidden' : ''}>
        {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </span>
      {isFollowing && (
        <span className="hidden group-hover:inline">
          Unfollow
        </span>
      )}
    </button>
  );
}