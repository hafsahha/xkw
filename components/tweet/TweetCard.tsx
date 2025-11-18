"use client";

import { useState } from "react";

// Custom SVG Icons
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const HeartSolid = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const ChatBubbleOvalLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const BookmarkSolid = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

const EllipsisHorizontalIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

interface TweetCardProps {
  tweet: {
    id: string;
    author: {
      id: string;
      username: string;
      name: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
    stats: {
      likes: number;
      retweets: number;
      quotes: number;
      replies: number;
    };
    type: 'Original' | 'Retweet' | 'Quote Tweet' | 'Reply';
    parentTweetId?: string;
  };
  currentUserId?: string;
}

export default function TweetCard({ tweet, currentUserId }: TweetCardProps) {
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
    window.location.href = `/tweet/${tweet.id}`;
  };

  return (
    <article 
      className="border-b border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
      onClick={handleTweetClick}
    >
      {/* Retweet indicator */}
      {tweet.type === 'Retweet' && (
        <div className="flex items-center mb-2 text-gray-500 text-sm">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          <span>You retweeted</span>
        </div>
      )}

      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
        
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
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tweet Content */}
          <div className="mt-1">
            <p className="text-gray-900 whitespace-pre-wrap">{tweet.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Reply */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                <ChatBubbleOvalLeftIcon className="h-4 w-4" />
              </div>
              {localStats.replies > 0 && (
                <span className="text-sm">{formatNumber(localStats.replies)}</span>
              )}
            </button>

            {/* Retweet */}
            <button 
              onClick={handleRetweet}
              className={`flex items-center space-x-2 transition-colors group ${
                isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <ArrowPathIcon className="h-4 w-4" />
              </div>
              {localStats.retweets > 0 && (
                <span className="text-sm">{formatNumber(localStats.retweets)}</span>
              )}
            </button>

            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors group ${
                isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                {isLiked ? (
                  <HeartSolid className="h-4 w-4" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
              </div>
              {localStats.likes > 0 && (
                <span className="text-sm">{formatNumber(localStats.likes)}</span>
              )}
            </button>

            {/* Bookmark */}
            <button 
              onClick={handleBookmark}
              className={`flex items-center space-x-2 transition-colors group ${
                isBookmarked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                {isBookmarked ? (
                  <BookmarkSolid className="h-4 w-4" />
                ) : (
                  <BookmarkIcon className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Share */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                <ShareIcon className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}