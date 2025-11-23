'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, ChevronsLeft, ChevronsRight, Ellipsis, Heart, Loader2, MessageCircleMore, Repeat2, Share2, X } from 'lucide-react';
import { Post, PostStats, User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import FloatingModal from '@/components/ui/FloatingModal';
import TweetCard from '@/components/tweet/TweetCard';
import Image from 'next/image';
import Link from 'next/link';

export default function PhotoModal({ params }: { params: Promise<{ id: string, idx: string }> }) {
  const router = useRouter();
  const optionsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
  const [isRetweeted, setIsRetweeted] = useState<boolean | null>(null);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [tweetStats, setTweetStats] = useState<PostStats | null>(null)
  const [tweet, setTweet] = useState<Post | null>(null);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);
  const [isLoadingRetweet, setIsLoadingRetweet] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { id, idx } = React.use(params);
  const photo = tweet ? tweet.media?.[parseInt(idx) - 1] ?? null : null;

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setLoggedUser(storedUser), 0);
    return () => clearTimeout(t);
  }, [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!optionsRef.current || !sidebarRef.current) return;
      if (target && !optionsRef.current.contains(target)) setIsOptionOpen(false);
      if (target && !sidebarRef.current.contains(target)) setIsSidebarOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

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
      setIsBookmarked(data.isBookmarked);
      setIsRetweeted(data.isRetweeted);
      setIsLiked(data.isLiked);
      setTweetStats(data.stats as PostStats);
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
        setReplyText("");
        const refreshResponse = await fetch(`/api/post?id=${id}&currentUser=${loggedUser}`);
        const refreshData = await refreshResponse.json();
        setTweet(refreshData);
      } else { alert("Gagal post reply") }
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally { setIsReplying(false) }
  };

  const handleLike = async () => {
    if (isLoadingLike) return; // Prevent duplicate clicks
    
    setIsLiked(!isLiked);
    setTweetStats(prev => prev ? { ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 } : null);
    setIsLoadingLike(true);

    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedUser, tweetId: id })
      });
    } catch {
      setIsLiked(!isLiked);
      setTweetStats(prev => prev ? { ...prev, likes: isLiked ? prev.likes + 1 : prev.likes - 1 } : null);
    } finally { setIsLoadingLike(false) }
  };

  const handleRetweet = async () => {
    if (isLoadingRetweet) return; // Prevent duplicate clicks
    
    setIsRetweeted(!isRetweeted);
    setTweetStats(prev => prev ? { ...prev, retweets: isRetweeted ? prev.retweets - 1 : prev.retweets + 1 } : null);
    setIsLoadingRetweet(true);
    
    try {
      await fetch('/api/retweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedUser, postId: id })
      });
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
        body: JSON.stringify({ username: loggedUser, tweetId: id })
      });
    } finally { setIsLoadingBookmark(false) }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!photo || !tweet || !tweetStats) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <p className="text-white">Loading image...</p>
      </div>
    )
  }

  return (
    <div
      ref={sidebarRef}
      onClick={() => router.back()}
      className="fixed inset-0 z-50 flex max-h-screen items-center justify-center bg-black/75 backdrop-blur-sm"
    >
      <div className="relative w-full h-full">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-white">
          <X size={32} />
        </button>

        <button onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }} className="absolute top-4 right-4 text-white">
          {isSidebarOpen ? <ChevronsRight size={32} /> : <ChevronsLeft size={32} /> }
        </button>

        {/* The Content */}
        <div className="flex flex-col w-full h-screen overflow-hidden">
          <Image
            onClick={(e) => e.stopPropagation()}
            src={`/img/${photo}`} alt="Tweet image"
            width={1200} height={1200}
            className="w-auto h-auto max-w-full max-h-[90vh] m-auto object-contain"
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 flex py-4 w-full justify-center gap-24 bg-gradient-to-t from-black to-black/0"
          >
            {/* Reply */}
            <button className="flex items-center space-x-2 text-white hover:text-pink-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-pink-500/20 transition-colors">
                <MessageCircleMore className="h-6 w-6" />
              </div>
            </button>

            {/* Retweet */}
            <button 
              onClick={handleRetweet}
              disabled={isLoadingRetweet}
              className={`flex items-center space-x-2 transition-colors group ${
                isRetweeted ? 'text-green-500' : 'text-white hover:text-green-500'
              } ${isLoadingRetweet ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/20 transition-colors">
                <Repeat2 className="h-6 w-6" />
              </div>
            </button>

            {/* Like */}
            <button 
              onClick={handleLike}
              disabled={isLoadingLike}
              className={`flex items-center space-x-2 transition-colors group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } ${isLoadingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/20 transition-colors">
                <Heart className={`h-6 w-6 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              </div>
            </button>

            {/* Reply */}
            <button className="flex items-center space-x-2 text-white hover:text-pink-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-pink-500/20 transition-colors">
                <Share2 className="h-6 w-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
      {isSidebarOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col w-1/3 h-full bg-white text-black overflow-y-auto scrollbar-hide"
        >
          <article className="w-full h-fit p-4 border-b border-gray-200">
            <div className="flex space-x-3 mb-2">
              <Link href={`/profile/${tweet.author.username}`} className="w-10 h-10 flex-shrink-0">
                <Image src={`/img/${tweet.author.avatar}`} alt={tweet.author.name} className="w-full h-full rounded-full object-cover" width={40} height={40} />
              </Link>
              <div className="flex w-full justify-between">
                <div className="flex flex-col space-x-1 mb-2">
                  <Link href={`/profile/${tweet!.author.username}`} className="w-fit font-semibold text-gray-900 hover:underline cursor-pointer">
                    {tweet!.author.name}
                  </Link>
                  <Link href={`/profile/${tweet!.author.username}`} className="w-fit text-gray-500">
                    @{tweet!.author.username}
                  </Link>
                </div>
                <div ref={optionsRef} className="relative">
                  <button
                    onClick={() => setIsOptionOpen(!isOptionOpen)}
                    className="relative h-fit text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                    <Ellipsis className="h-4 w-4" />
                  </button>
                  {isOptionOpen && <FloatingModal type="tweetOptions" tweet={tweet} onClose={() => setIsOptionOpen(false)} />}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-900 text-xl leading-relaxed">{tweet.content}</p>
            </div>
            <div className="text-gray-500 mb-2">
              {new Date(tweet.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {new Date(tweet.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around py-1 border-y border-gray-200">
              {/* Reply */}
              <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                  <MessageCircleMore className="h-5 w-5" />
                </div>
                  <span className="text-sm">{tweetStats.replies > 0 ? formatNumber(tweetStats.replies) : ' '}</span>
              </button>

              {/* Retweet */}
              <button 
                onClick={handleRetweet}
                disabled={isLoadingRetweet}
                className={`flex items-center space-x-2 transition-colors group ${
                  isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                } ${isLoadingRetweet ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                  <Repeat2 className="h-5 w-5" />
                </div>
                <span className="text-sm">{tweetStats.retweets > 0 ? formatNumber(tweetStats.retweets) : ' '}</span>
              </button>

              {/* Like */}
              <button 
                onClick={handleLike}
                disabled={isLoadingLike}
                className={`flex items-center space-x-2 transition-colors group ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                } ${isLoadingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                  <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                </div>
                <span className="text-sm">{tweetStats.likes > 0 ? formatNumber(tweetStats.likes) : ' '}</span>
              </button>
              
              {/* Bookmark */}
              <button 
                onClick={handleBookmark}
                className={`flex items-center transition-colors group ${
                  isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'text-blue-500 fill-blue-500' : ''}`} />
                </div>
              </button>
            </div>

            {/* Reply Form */}
            <div className="pt-4 border-gray-200">
              <div className="flex space-x-3">
                {currentUser ?
                  <Image src={`/img/${currentUser.media.avatar ?? "default_avatar.png"}`} className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" width={40} height={40} alt="User avatar" />
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
          </article>

          {/* Replies */}
          <div className="divide-y divide-gray-200">
            {tweet ? (
              tweet!.replies && tweet!.replies.length > 0 ? (
                tweet!.replies.map((reply, _) => <TweetCard key={_} tweet={reply} sidebarMode />)
              ) : (
                <p className="text-center text-gray-500 py-4">No replies yet.</p>
              )
            ) : (
              <div className="flex mt-4 justify-center">
                <Loader2 className="animate-spin w-6 h-6 text-pink-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}