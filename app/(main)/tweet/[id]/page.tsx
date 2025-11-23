"use client";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Post, PostStats, User } from "@/lib/types";
import TweetCard from "@/components/tweet/TweetCard";
import Link from "next/link";

export default function TweetPage({ params }: { params: Promise<{ id: string }> }) {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tweet, setTweet] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { id } = React.use(params);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setLoggedUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    async function fetchUser(username: string) {
      const response = await fetch(`/api/user?username=${username}`);
      const data = await response.json();
      setCurrentUser(data as User);
    }
    if(loggedUser) fetchUser(loggedUser);
  }, [loggedUser])
  
  useEffect(() => {
    async function fetchTweet() {
      const response = await fetch(`/api/post?id=${id}&currentUser=${loggedUser}`);
      const data = await response.json();
      setTweet(data as Post);
    }
    if (loggedUser) fetchTweet();
  }, [id, loggedUser]);

  const handleReply = async () => {
    if (!replyText.trim() || !loggedUser || !tweet) return;

    setIsReplying(true);
    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loggedUser,
          content: replyText,
          media: [],
          tweetRef: tweet.tweetId,
          type: "Reply"
        })
      });

      if (response.ok) {
        console.log("Reply posted");
        setReplyText("");
        
        // Refresh halaman untuk update replies
        const refreshResponse = await fetch(`/api/post?id=${id}&currentUser=${loggedUser}`);
        const refreshData = await refreshResponse.json();
        setTweet(refreshData);
        setTweetStats(refreshData.stats as PostStats);
      } else {
        alert("Gagal post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-black">Post</h1>
        </div>
      </div>

      {/* Main Tweet */}
      {tweet ? (
        <div className="border-b border-gray-200">
          <TweetCard tweet={tweet} />
        </div>
      ) : (
        <div className="animate-pulse p-4 pb-2 border-b border-gray-200">
          <div className="flex space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-10/12"></div>
          </div>

          <div className="h-4 bg-gray-200 rounded w-40 mb-3"></div>

          <div className="flex items-center space-x-6 py-2 border-t border-b border-gray-200 text-sm">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          <div className="flex items-center justify-around pt-3">
            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Reply Form */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-3">
          {currentUser ?
            <Image src={`/img/${currentUser!.media.profileImage}`} className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" width={40} height={40} alt="User avatar" />
          :
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse flex-shrink-0"></div>
          }
          <div className="flex-1">
            <textarea 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Post your reply"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
              disabled={isReplying}
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={handleReply}
                disabled={!replyText.trim() || isReplying || !loggedUser}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReplying ? "Replying..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="divide-y divide-gray-200">
        {tweet ? (
          tweet!.replies && tweet!.replies.length > 0 ? (
            tweet!.replies.map((reply, _) => <TweetCard key={_} tweet={reply} />)
          ) : <p>No replies yet.</p>
        ) : (
          <div className="flex mt-4 justify-center">
            <Loader2 className="animate-spin w-6 h-6 text-pink-500" />
          </div>
        )}
      </div>
    </>
  )
}