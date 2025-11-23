"use client";
import { Calendar, ImageIcon, MapPin, Smile } from "lucide-react";
import { useState } from "react";
import { User } from "@/lib/types";
import Image from "next/image";

export default function TweetComposer({ user, loading, onTweetPosted }: { user?: User, loading?: boolean, onTweetPosted?: () => void }) {
  const [tweetText, setTweetText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const maxLength = 280;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetText.trim() || !user) return;

    setIsPosting(true);
    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          content: tweetText,
          media: [],
          type: "Original"
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Tweet posted:", data);
        setTweetText("");
        setIsExpanded(false);
        
        // Callback untuk refresh feed
        if (onTweetPosted) {
          onTweetPosted();
        }
      } else {
        alert("Gagal posting tweet");
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsPosting(false);
    }
  };

  const getCharacterCountColor = () => {
    if (tweetText.length > maxLength * 0.9) return 'text-red-500';
    if (tweetText.length > maxLength * 0.8) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getProgressColor = () => {
    if (tweetText.length > maxLength) return 'text-red-500';
    if (tweetText.length > maxLength * 0.8) return 'text-yellow-500';
    return 'text-gray-300';
  };

  if (loading) {
    return (
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="size-10 bg-gray-300 rounded-full flex-shrink-0 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-6 mt-2 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border-b border-gray-200 p-4 ${isExpanded ? 'pb-2' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <Image src={'/img/' + (user?.media?.profileImage ?? "1.jpg")} alt={user?.name || "User avatar"} className="size-10 rounded-full flex-shrink-0" width={40} height={40} />

          {/* Compose Area */}
          <div className="flex-1">
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's happening?"
              className="w-full pt-1 text-xl placeholder-gray-500 resize-none border-none outline-none bg-transparent"
              rows={isExpanded ? 3 : 1}
              maxLength={maxLength}
            />
            
            {isExpanded && (
              <>
                {/* Options */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Character Count */}
                    {tweetText.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm ${getCharacterCountColor()}`}>
                          {maxLength - tweetText.length}
                        </div>
                        <svg className="w-5 h-5" viewBox="0 0 20 20">
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className={getProgressColor()}
                            strokeDasharray={`${(tweetText.length / maxLength) * 50.27} 50.27`}
                            transform="rotate(-90 10 10)"
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* Post Button */}
                    <button
                      type="submit"
                      disabled={!tweetText.trim() || tweetText.length > maxLength || isPosting}
                      className="bg-pink-500 text-white px-4 py-1.5 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
                    >
                      {isPosting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}