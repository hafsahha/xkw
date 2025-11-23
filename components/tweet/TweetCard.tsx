"use client";
import { Bookmark, Ellipsis, Heart, MessageCircleMore, Quote, Repeat2, Share2 } from "lucide-react";
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

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
      } else {
        console.error("Failed to toggle like");
        setIsLiked(!newLikedState);
        setLocalStats(prev => ({ ...prev, likes: newLikedState ? prev.likes - 1 : prev.likes + 1 }));
      }
    } catch (error) {
      console.error("Like error:", error);
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
        body: JSON.stringify({ 
          username: currentUser, 
          postId: tweet.tweetId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        if (onRetweetSuccess) {
          onRetweetSuccess();
        }
      } else {
        console.error("Failed to toggle retweet");
        setIsRetweeted(!newRetweetState);
        setLocalStats(prev => ({ ...prev, retweets: newRetweetState ? prev.retweets - 1 : prev.retweets + 1 }));
      }
    } catch (error) {
      console.error("Retweet error:", error);
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
        body: JSON.stringify({ 
          username: currentUser, 
          tweetId: tweet.tweetId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
      } else {
        console.error("Failed to toggle bookmark");
        setIsBookmarked(!newBookmarkState);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
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
        className="border-b border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
        onClick={() => window.location.href = `/tweet/${tweet.tweetId}`}
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
          <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()} className="h-fit">
            <Image src={'/img/' + tweet.author.avatar} alt={tweet.author.name} className="size-10 rounded-full flex-shrink-0" width={40} height={40} />
          </Link>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-1">
              <Link href={`/profile/${tweet.author.username}`} onClick={(e) => e.stopPropagation()} className="flex items-center space-x-1">
                <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  {tweet.author.name}
                </h3>
                <span className="text-gray-500">@{tweet.author.username}</span>
              </Link>
              <span className="text-gray-500">·</span>
              <time className="text-gray-500 text-sm">
                {formatTime(tweet.createdAt)}
              </time>
              
              {/* Options */}
              <div className="ml-auto relative" ref={optionsRef}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOptionOpen(!isOptionOpen); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Ellipsis className="h-4 w-4 text-gray-500" />
                </button>
                
                <FloatingModal 
                  isOpen={isOptionOpen} 
                  onClose={() => setIsOptionOpen(false)}
                  tweet={tweet}
                >
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                      Delete
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      Edit
                    </button>
                  </div>
                </FloatingModal>
              </div>
            </div>

            {/* Content Text */}
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">
              {tweet.content}
            </p>

            {/* Media */}
            {tweet.media && tweet.media.length > 0 && (
              <div className={`mt-3 ${tweet.media.length > 1 ? 'grid gap-2' : ''} ${
                tweet.media.length === 2 ? 'grid-cols-2' :
                tweet.media.length === 3 ? 'grid-cols-2 grid-rows-2' :
                tweet.media.length === 4 ? 'grid-cols-2 grid-rows-2' : ''
              } max-h-96 rounded-xl overflow-hidden`}>
                {tweet.media.map((mediaUrl, idx) => (
                  <Link
                    key={idx}
                    onClick={(e) => e.stopPropagation()}
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

            {/* Retweet with dropdown */}
            <div ref={retweetDropdownRef} className="relative">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsRetweetDropdownOpen(!isRetweetDropdownOpen);
                }}
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
              
              {/* Dropdown Menu */}
              {isRetweetDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRetweetDropdownOpen(false);
                      handleRetweet();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Repeat2 className="h-4 w-4" />
                    <span>{isRetweeted ? 'Undo retweet' : 'Retweet'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRetweetDropdownOpen(false);
                      setIsQuoteModalOpen(true);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Quote className="h-4 w-4" />
                    <span>Quote Tweet</span>
                  </button>
                </div>
              )}
            </div>

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
                disabled={isLoadingBookmark}
                className={`flex items-center space-x-2 transition-colors group ${
                  isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                } ${isLoadingBookmark ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      </article>

      {/* Quote Tweet Modal */}
      {currentUser && (
        <QuoteTweetModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          originalTweet={tweet}
          currentUser={currentUser}
          onQuoteSuccess={onRetweetSuccess}
        />
      )}
    </>
  );
}