"use client";
import { Bookmark, Ellipsis, Heart, MessageCircleMore, Quote, Repeat2, Share2, BarChart2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types";
import FloatingModal from "../ui/FloatingModal";
import Image from "next/image";
import Link from "next/link";
import QuoteTweetModal from "./QuoteTweetModal";

export default function TweetCard({ tweet, onRetweetSuccess }: { tweet: Post, onRetweetSuccess?: () => void }) {
  // Safe guard for incomplete data
  if (!tweet || !tweet.author || !tweet.stats) {
    return (
      <div className="border-b border-gray-200 p-4">
        <div className="text-gray-500">Loading tweet...</div>
      </div>
    );
  }

  const optionsRef = useRef<HTMLDivElement | null>(null);
  const retweetDropdownRef = useRef<HTMLDivElement | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [localStats, setLocalStats] = useState(tweet.stats);
  const [isBookmarked, setIsBookmarked] = useState(tweet.isBookmarked || false);
  const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted || false);
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [isLoadingRetweet, setIsLoadingRetweet] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isRetweetDropdownOpen, setIsRetweetDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setCurrentUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      
      // Close options dropdown if clicked outside
      if (optionsRef.current && target && !optionsRef.current.contains(target)) {
        setIsOptionOpen(false);
      }
      
      // Close retweet dropdown if clicked outside  
      if (retweetDropdownRef.current && target && !retweetDropdownRef.current.contains(target)) {
        setIsRetweetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // --- Handlers (Like, Retweet, Bookmark) ---
  const handleLike = async () => {
    if (isLoadingLike || !currentUser) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalStats(prev => ({ ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 }));
    setIsLoadingLike(true);

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, postId: tweet.tweetId })
      });
      if (!response.ok) throw new Error("Failed");
    } catch (error) {
      setIsLiked(!newLikedState);
      setLocalStats(prev => ({ ...prev, likes: newLikedState ? prev.likes - 1 : prev.likes + 1 }));
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleRetweet = async () => {
    if (isLoadingRetweet || !currentUser) return;
    const newRetweetState = !isRetweeted;
    setIsRetweeted(newRetweetState);
    setLocalStats(prev => ({ ...prev, retweets: isRetweeted ? prev.retweets - 1 : prev.retweets + 1 }));
    setIsLoadingRetweet(true);
    
    try {
      const response = await fetch('/api/retweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, postId: tweet.tweetId })
      });
      if (response.ok) {
        if (onRetweetSuccess) onRetweetSuccess();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      setIsRetweeted(!newRetweetState);
      setLocalStats(prev => ({ ...prev, retweets: newRetweetState ? prev.retweets - 1 : prev.retweets + 1 }));
    } finally {
      setIsLoadingRetweet(false);
    }
  };

  const handleBookmark = async () => {
    if (isLoadingBookmark || !currentUser) return;
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    setIsLoadingBookmark(true);
    
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, postId: tweet.tweetId })
      });
      if (!response.ok) throw new Error("Failed");
    } catch (error) {
      setIsBookmarked(!newBookmarkState);
    } finally {
      setIsLoadingBookmark(false);
    }
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
    <>
      <article 
        className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer px-4 pt-3 pb-2"
        onClick={() => window.location.href = `/tweet/${tweet.tweetId}`}
      >
        {/* Retweet indicator */}
        {tweet.type === 'Retweet' && (
          <div className="flex items-center mb-1 ml-8 text-gray-500 text-[13px] font-bold">
            <Repeat2 className="h-4 w-4 mr-2" />
            <span>You retweeted</span>
          </div>
        )}

        <div className="flex gap-3">
          {/* Left Column: Avatar */}
          <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0 pt-1">
            <Image 
                src={'/img/' + tweet.author.avatar} 
                alt={tweet.author.name} 
                className="size-10 rounded-full object-cover hover:brightness-90 transition-all" 
                width={40} 
                height={40} 
            />
          </Link>
          
          {/* Right Column: Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Name, Handle, Time, Menu */}
            <div className="flex items-start justify-between">
              <div className="flex items-center flex-wrap text-[15px] leading-5 truncate">
                <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 min-w-0 truncate">
                  <span className="font-bold text-[#0f1419] hover:underline truncate">
                    {tweet.author.name}
                  </span>
                  <span className="text-gray-500 truncate">@{tweet.author.username}</span>
                </Link>
                <span className="text-gray-500 mx-1">·</span>
                <time className="text-gray-500 hover:underline text-[15px]">
                  {formatTime(tweet.createdAt)}
                </time>
              </div>
              
              {/* Options Dots */}
              <div className="relative -mt-1 -mr-2" ref={optionsRef}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOptionOpen(!isOptionOpen); }}
                  className="p-2 text-gray-500 hover:bg-sky-50 hover:text-sky-500 rounded-full transition-colors"
                >
                  <Ellipsis className="h-[18px] w-[18px]" />
                </button>
                
                <FloatingModal 
                  isOpen={isOptionOpen} 
                  onClose={() => setIsOptionOpen(false)}
                  tweet={tweet}
                >
                  <div className="py-1 shadow-box font-medium">
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-100 text-[#f4212e] flex items-center gap-2">
                       Delete
                    </button>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-100 text-[#0f1419] flex items-center gap-2">
                       Edit
                    </button>
                  </div>
                </FloatingModal>
              </div>
            </div>

            {/* Content Text - The Fix for "Meleber" */}
            <div className="text-[#0f1419] text-[15px] leading-normal whitespace-pre-wrap break-words mt-0.5">
              {tweet.content}
            </div>

            {/* Media Grid */}
            {tweet.media && tweet.media.length > 0 && (
              <div className={`mt-3 ${tweet.media.length > 1 ? 'grid gap-0.5' : ''} ${
                tweet.media.length === 2 ? 'grid-cols-2' :
                tweet.media.length === 3 ? 'grid-cols-2 grid-rows-2' :
                tweet.media.length === 4 ? 'grid-cols-2 grid-rows-2' : ''
              } rounded-2xl overflow-hidden border border-gray-200`}>
                {tweet.media.map((mediaUrl, idx) => (
                  <Link
                    key={idx}
                    onClick={(e) => e.stopPropagation()}
                    href={`/tweet/${tweet.tweetId}/image/${idx + 1}`}
                    className={`relative ${tweet.media.length > 1 ? 'h-full w-full aspect-square' : ''} ${tweet.media.length === 3 && idx === 0 ? 'row-span-2' : ''}`}
                  >
                    <Image
                      src={`/img/${mediaUrl}`} alt={`media ${idx + 1}`}
                      className={`${tweet.media.length > 1 ? 'h-full w-full' : 'w-full h-auto'} object-cover`}
                      width={1000} height={1000}
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex w-full items-center justify-between mt-1 max-w-[425px]">
              {/* Reply */}
              <button 
                onClick={(e) => e.stopPropagation()}
                className="group flex items-center space-x-1 -ml-2"
              >
                <div className="p-2 rounded-full group-hover:bg-sky-50 transition-colors">
                  <MessageCircleMore className="h-[18px] w-[18px] text-gray-500 group-hover:text-sky-500" />
                </div>
                <span className="text-[13px] text-gray-500 group-hover:text-sky-500">
                    {localStats.replies > 0 ? formatNumber(localStats.replies) : ''}
                </span>
              </button>

              {/* Retweet */}
              <div className="relative">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsRetweetDropdownOpen(!isRetweetDropdownOpen);
                  }}
                  disabled={isLoadingRetweet}
                  className="group flex items-center space-x-1"
                >
                  <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                    <Repeat2 className={`h-[18px] w-[18px] ${isRetweeted ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`} />
                  </div>
                  <span className={`text-[13px] ${isRetweeted ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'}`}>
                     {localStats.retweets > 0 ? formatNumber(localStats.retweets) : ''}
                  </span>
                </button>
                
                {isRetweetDropdownOpen && (
                  <div className="absolute top-0 right-0 mt-8 bg-white border border-gray-100 rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.1)] py-2 z-20 w-40 font-bold text-[15px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRetweetDropdownOpen(false);
                        handleRetweet();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-[#0f1419]"
                    >
                      <Repeat2 className="h-[18px] w-[18px]" />
                      <span>{isRetweeted ? 'Undo repost' : 'Repost'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRetweetDropdownOpen(false);
                        setIsQuoteModalOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-[#0f1419]"
                    >
                      <Quote className="h-[18px] w-[18px]" />
                      <span>Quote</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Like */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                disabled={isLoadingLike}
                className="group flex items-center space-x-1"
              >
                <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                  <Heart className={`h-[18px] w-[18px] ${isLiked ? 'text-[#f91880] fill-[#f91880]' : 'text-gray-500 group-hover:text-[#f91880]'}`} />
                </div>
                <span className={`text-[13px] ${isLiked ? 'text-[#f91880]' : 'text-gray-500 group-hover:text-[#f91880]'}`}>
                   {localStats.likes > 0 ? formatNumber(localStats.likes) : ''}
                </span>
              </button>

              {/* Views / Stats (Optional, matching visual balance) */}
              <button 
                 onClick={(e) => e.stopPropagation()}
                 className="group flex items-center space-x-1"
              >
                  <div className="p-2 rounded-full group-hover:bg-sky-50 transition-colors">
                    <BarChart2 className="h-[18px] w-[18px] text-gray-500 group-hover:text-sky-500" />
                  </div>
                   <span className="text-[13px] text-gray-500 group-hover:text-sky-500">
                    {/* Random view count or from props */}
                    {formatNumber(tweet.stats.views || 0)} 
                   </span>
              </button>

              {/* Share & Bookmark Group */}
              <div className="flex items-center">
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                  disabled={isLoadingBookmark}
                  className="group flex items-center"
                >
                  <div className="p-2 rounded-full group-hover:bg-sky-50 transition-colors">
                    <Bookmark className={`h-[18px] w-[18px] ${isBookmarked ? 'text-sky-500 fill-sky-500' : 'text-gray-500 group-hover:text-sky-500'}`} />
                  </div>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center"
                >
                  <div className="p-2 rounded-full group-hover:bg-sky-50 transition-colors">
                    <Share2 className="h-[18px] w-[18px] text-gray-500 group-hover:text-sky-500" />
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </article>

      {/* Quote Tweet Modal */}
      <QuoteTweetModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        originalTweet={tweet}
        currentUser={currentUser || "Guest"} // Provide a fallback for currentUser
        onQuoteSuccess={onRetweetSuccess}
      />
    </>
  );
}