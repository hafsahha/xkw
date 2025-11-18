"use client";
import { Bookmark, Ellipsis, Heart, MessageCircleMore, Repeat2, Share2 } from "lucide-react";
import { useState } from "react";
import { Post } from "@/lib/types";
import Image from "next/image";

export default function TweetCard({ tweet }: { tweet: Post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [localStats, setLocalStats] = useState(tweet.stats);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLocalStats(prev => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1
    }));
    // TODO: API call
  };

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    setLocalStats(prev => ({
      ...prev,
      retweets: isRetweeted ? prev.retweets - 1 : prev.retweets + 1
    }));
    // TODO: API call
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: API call
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
  };

  const handleTweetClick = () => {
    window.location.href = `/tweet/${tweet.tweetId}`;
  };

  return (
    <article 
      className="border-b border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
      onClick={handleTweetClick}
    >
      {/* Retweet indicator */}
      {tweet.type === 'Retweet' && (
        <div className="flex items-center mb-2 text-gray-500 text-sm">
          <Repeat2 className="h-4 w-4 mr-2" />
          <span>You retweeted</span>
        </div>
      )}

      <div className="flex space-x-3">
        {/* Avatar */}
        <Image src={'/img/' + tweet.author.media.profileImage} alt={tweet.author.name} className="size-10 rounded-full flex-shrink-0" width={40} height={40} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-1">
            <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
              {tweet.author.name}
            </h3>
            <span className="text-gray-500">@{tweet.author.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500 text-sm">
              {formatTime(tweet.createdAt)}
            </time>
            <div className="ml-auto">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <Ellipsis className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tweet Content */}
          <div className="mt-1">
            <p className="text-gray-900 whitespace-pre-wrap">{tweet.content}</p>
          </div>

          {/* Actions */}
          <div className="flex w-full items-center justify-between mt-3">
            {/* Reply */}
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                <MessageCircleMore className="h-4 w-4" />
              </div>
              {localStats.replies > 0 && (
                <span className="text-sm">{formatNumber(localStats.replies)}</span>
              )}
            </button>

            {/* Retweet */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleRetweet(); }}
              className={`flex items-center space-x-2 transition-colors group ${
                isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Repeat2 className="h-4 w-4" />
              </div>
              {localStats.retweets > 0 && (
                <span className="text-sm">{formatNumber(localStats.retweets)}</span>
              )}
            </button>

            {/* Like */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className={`flex items-center space-x-2 transition-colors group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              </div>
              {localStats.likes > 0 && (
                <span className="text-sm">{formatNumber(localStats.likes)}</span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              {/* Bookmark */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                className={`flex items-center space-x-2 transition-colors group ${
                  isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'text-blue-500 fill-blue-500' : ''}`} />
                </div>
              </button>

              {/* Share */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}