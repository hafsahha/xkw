"use client";
import { Bookmark, Ellipsis, Heart, MessageCircleMore, Repeat2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types";
import FloatingModal from "../ui/FloatingModal";
import Image from "next/image";
import Link from "next/link";

export default function TweetCard({ tweet, sidebarMode, onRetweetSuccess }: { tweet: Post, sidebarMode?: boolean, onRetweetSuccess?: () => void }) {
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [localStats, setLocalStats] = useState(tweet.stats);
  const [isBookmarked, setIsBookmarked] = useState(tweet.isBookmarked);
  const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted);
  const [isLiked, setIsLiked] = useState(tweet.isLiked);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);
  const [isLoadingRetweet, setIsLoadingRetweet] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setCurrentUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!optionsRef.current) return;
      if (target && !optionsRef.current.contains(target)) setIsOptionOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleLike = async () => {
    if (isLoadingLike) return; // Prevent duplicate clicks
    
    setIsLiked(!isLiked);
    setLocalStats(prev => ({ ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 }));
    setIsLoadingLike(true);

    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, tweetId: tweet.tweetId })
      });
    } catch {
      setIsLiked(!isLiked);
      setLocalStats(prev => ({ ...prev, likes: isLiked ? prev.likes + 1 : prev.likes - 1 }));
    } finally { setIsLoadingLike(false) }
  };

  const handleRetweet = async () => {
    if (isLoadingRetweet) return; // Prevent duplicate clicks
    
    setIsRetweeted(!isRetweeted);
    setLocalStats(prev => ({ ...prev, retweets: isRetweeted ? prev.retweets - 1 : prev.retweets + 1 }));
    setIsLoadingRetweet(true);
    
    try {
      const response = await fetch('/api/retweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, postId: tweet.tweetId })
      });

      if (response.ok) if (onRetweetSuccess) { onRetweetSuccess() }
    } finally { setIsLoadingRetweet(false) }
  };

  const handleBookmark = async () => {
    if (isLoadingBookmark) return; // Prevent duplicate clicks

    setIsBookmarked(!isBookmarked);
    setIsLoadingBookmark(true);

    try {
      await fetch('/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, tweetId: tweet.tweetId })
      });
    } finally { setIsLoadingBookmark(false) }
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

  return (
    <article 
      className={`border-b border-gray-200 p-4 ${tweet.type === 'Retweet' ? 'pt-1' : ''} hover:bg-gray-50/50 transition-colors cursor-pointer`}
      onClick={() => window.location.href = `/tweet/${tweet.tweetId}`}
    >
      {/* Retweet indicator */}
      {tweet.type === 'Retweet' && (
        <div className="flex items-center mb-1 text-gray-500 text-sm space-x-3">
          <div className="flex w-10 mt-0.5 justify-end">
            <Repeat2 className="h-4 w-4 flex-shrink-0" />
          </div>
          <span>You retweeted</span>
        </div>
      )}

      <div className="flex space-x-3">
        {/* Avatar */}
        <Link href={`/profile/${tweet.author.username}`} className="w-10 h-10 flex-shrink-0">
          <Image src={`/img/${tweet.author.avatar}`} alt={tweet.author.name} className="w-full h-full rounded-full object-cover" width={40} height={40} />
        </Link>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-1">
            <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()} className="flex items-center space-x-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 hover:underline cursor-pointer ${sidebarMode ? 'truncate' : ''}`}>
              {tweet.author.name}
              </h3>
              <span className={`text-gray-500 ${sidebarMode ? 'truncate' : ''}`}>
                @{tweet.author.username}
              </span>
            </Link>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500 text-sm">
              {formatTime(tweet.createdAt)}
            </time>
            <div ref={optionsRef} className="relative ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setIsOptionOpen(!isOptionOpen); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <Ellipsis className="h-4 w-4" />
              </button>
              {isOptionOpen && <FloatingModal type="tweetOptions" tweet={tweet} onClose={() => setIsOptionOpen(false)} />}
            </div>
          </div>

          {/* Tweet Content */}
          <div className="flex flex-col mt-1 gap-1">
            <p className="text-gray-900 whitespace-pre-wrap">{tweet.content}</p>
            {tweet.media.length > 0 && (
              <div className={`mt-2 ${tweet.media.length > 1 ? `grid grid-cols-2 auto-rows-fr rounded-xl ${sidebarMode ? 'h-40 gap-0.5' : 'h-80 gap-1'}` : 'flex w-full'} overflow-hidden items-center`}>
                {tweet.media.map((mediaUrl, idx) => (
                  <Link
                    key={idx} onClick={(e) => e.stopPropagation()}
                    href={`/tweet/${tweet.tweetId}/image/${idx + 1}`}
                    className={`${tweet.media.length > 1 ? 'h-full w-full' : ''} ${tweet.media.length === 3 && idx === 0 ? 'row-span-2' : ''}`}
                  >
                    <Image
                      src={`/img/${mediaUrl}`} alt={`media ${idx + 1}`}
                      className={`${tweet.media.length > 1 ? 'h-full w-full' : 'max-h-100 max-w-full w-auto h-auto rounded-xl'} object-cover`}
                      width={1000} height={1000}
                    />
                  </Link>
                ))}
              </div>
            )}
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
                <span className="text-sm">{localStats.replies > 0 ? formatNumber(localStats.replies) : ' '}</span>
            </button>

            {/* Retweet */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleRetweet(); }}
              disabled={isLoadingRetweet}
              className={`flex items-center space-x-2 transition-colors group ${
                isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              } ${isLoadingRetweet ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Repeat2 className="h-4 w-4" />
              </div>
              <span className="text-sm">{localStats.retweets > 0 ? formatNumber(localStats.retweets) : ' '}</span>
            </button>

            {/* Like */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              disabled={isLoadingLike}
              className={`flex items-center space-x-2 transition-colors group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } ${isLoadingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              </div>
              <span className="text-sm">{localStats.likes > 0 ? formatNumber(localStats.likes) : ' '}</span>
            </button>

            <div className="flex items-center space-x-2">
              {/* Bookmark */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                className={`flex items-center transition-colors group ${
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
                className="flex items-center text-gray-500 hover:text-pink-500 transition-colors group"
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

