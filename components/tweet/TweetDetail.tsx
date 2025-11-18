"use client";
import { Bookmark, ChevronLeft, Heart, MessageCircleMore, Repeat2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Post, User } from "@/lib/types";
import TweetCard from "./TweetCard";
import Image from "next/image";

export default function TweetDetail({ tweet, loading }: { tweet?: Post, loading?: boolean }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [replies, setReplies] = useState<Post[] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setLoggedUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    async function fetchUser(userId: string) {
      const response = await fetch('/api/user?id=' + userId);
      const data = await response.json();
      setCurrentUser(data as User);
    }
    if(loggedUser) fetchUser(loggedUser);
  }, [loggedUser])

  useEffect(() => {
    async function fetchReplies() {
      const response = await fetch('/api/post?repref=' + tweet!.tweetId);
      const data = await response.json();
      setReplies(data as Post[]);
    }
    if (tweet) fetchReplies();
  }, [tweet])

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-black">Post</h1>
        </div>
      </div>

      {/* Main Tweet */}
      <article className="p-4 pb-2 border-b border-gray-200">
        <div className="flex flex-col">
          <div className="flex space-x-3 mb-2">
            <Image src={`/img/${tweet!.author.media.profileImage}`} className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" width={40} height={40} alt="User avatar" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col space-x-1 mb-2">
                <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  {tweet!.author.name}
                </h3>
                <span className="text-gray-500">@{tweet!.author.username}</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-900 text-xl leading-relaxed">{tweet!.content}</p>
          </div>
          <div className="text-gray-500 mb-2">
            {new Date(tweet!.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {new Date(tweet!.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
            
          {/* Interaction Stats */}
          <div className="flex items-center space-x-6 py-2 border-t border-b border-gray-200 text-gray-500 text-sm">
            <span><span className="font-semibold text-gray-900">{tweet!.stats.retweets}</span> Retweets</span>
            <span><span className="font-semibold text-gray-900">{tweet!.stats.quotes}</span> Quote Tweets</span>
            <span><span className="font-semibold text-gray-900">{tweet!.stats.likes}</span> Likes</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-around pt-2 border-gray-200">
            <button className="p-2 hover:bg-pink-50 rounded-full transition-colors group">
              <MessageCircleMore className="w-5 h-5 text-gray-500 group-hover:text-pink-500" />
            </button>
            <button className="p-2 hover:bg-green-50 rounded-full transition-colors group">
              <Repeat2 className="w-5 h-5 text-gray-500 group-hover:text-green-500" />
            </button>
            <button className="p-2 hover:bg-red-50 rounded-full transition-colors group">
              <Heart className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors group">
              <Bookmark className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
            </button>
          </div>
        </div>
      </article>

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
              placeholder="Post your reply"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="divide-y divide-gray-200">
        {replies ? (
          replies.map((reply, _) => <TweetCard key={_} tweet={reply} />)
        ) : (
          <p>No replies yet.</p>
        )}
      </div>
    </>
  );
}