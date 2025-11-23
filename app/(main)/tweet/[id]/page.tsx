"use client";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bookmark, Ellipsis, Heart, Loader2, MessageCircleMore, Repeat2 } from "lucide-react";
import { Post, PostStats, User } from "@/lib/types";
import FloatingModal from "@/components/ui/FloatingModal";
import TweetCard from "@/components/tweet/TweetCard";
import Image from "next/image";
import Link from "next/link";

export default function TweetPage({ params }: { params: Promise<{ id: string }> }) {
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tweetStats, setTweetStats] = useState<PostStats | null>(null)
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
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!optionsRef.current) return;
      if (target && !optionsRef.current.contains(target)) setIsOptionOpen(false);
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
      setTweetStats(data.stats as PostStats)
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
        <article className="p-4 pb-2 border-b border-gray-200">
          <div className="flex flex-col">
            <div className="flex space-x-3 mb-2">
              <Link href={`/profile/${tweet!.author.username}`}>
                <Image src={`/img/${tweet!.author.avatar}`} className="w-10 h-10 rounded-full flex-shrink-0" width={40} height={40} alt="User avatar" />
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
                    onClick={(e) => { e.stopPropagation(); setIsOptionOpen(!isOptionOpen); }}
                    className="relative h-fit text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                    <Ellipsis className="h-4 w-4" />
                  </button>
                  {isOptionOpen && <FloatingModal type="tweetOptions" tweet={tweet} onClose={() => setIsOptionOpen(false)} />}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-900 text-xl leading-relaxed">{tweet!.content}</p>
              {tweet.media.length > 0 && (
                <div className={`mt-2 ${tweet.media.length > 1 ? 'grid h-80 grid-cols-2 auto-rows-fr gap-1 rounded-xl' : 'flex w-full'} overflow-hidden items-center`}>
                  {tweet.media.map((mediaUrl, idx) => (
                    <Link
                      key={idx} onClick={(e) => e.stopPropagation()}
                      href={`/tweet/${tweet.tweetId}/image/${idx + 1}`}
                      className={`h-full w-full ${tweet.media.length === 3 && idx === 0 ? 'row-span-2' : ''}`}
                    >
                      <Image
                        src={`/img/${mediaUrl}`} alt={`media ${idx + 1}`}
                        className={`${tweet.media.length === 1 ? 'rounded-xl' : ''} object-cover`}
                        width={1000} height={1000}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="text-gray-500 mb-2">
              {new Date(tweet!.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {new Date(tweet!.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
              
            {/* Interaction Stats */}
            <div className="flex items-center border-t border-b border-gray-200 text-gray-500 text-sm">
              <button
                // onClick={openRetweetsModal}
                className="px-3 py-2 hover:bg-gray-300"
              >
                <span className="font-semibold text-gray-900">{tweetStats!.retweets}</span> Retweets
              </button>
              <button
                // onClick={openQuotesModal}
                className="px-3 py-2 hover:bg-gray-300"
              >
                <span className="font-semibold text-gray-900">{tweetStats!.quotes}</span> Quote Tweets
              </button>
              <button
                // onClick={openLikesModal}
                className="px-3 py-2 hover:bg-gray-300"
                >
              <span className="font-semibold text-gray-900">{tweetStats!.likes}</span> Likes
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around pt-2 border-gray-200">
              <button className="p-2 hover:bg-pink-50 rounded-full transition-colors group">
                <MessageCircleMore className="w-5 h-5 text-gray-500 group-hover:text-pink-500" />
              </button>
              <button className="p-2 hover:bg-green-50 rounded-full transition-colors group">
                <Repeat2 className={`w-5 h-5 group-hover:text-green-500 ${tweet!.isRetweeted ? 'text-green-500 fill-green-500' : 'text-gray-500'}`} />
              </button>
              <button className="p-2 hover:bg-red-50 rounded-full transition-colors group">
                <Heart className={`w-5 h-5 group-hover:text-red-500 ${tweet!.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors group">
                <Bookmark className={`w-5 h-5 group-hover:text-blue-500 ${tweet!.isBookmarked ? 'text-blue-500 fill-blue-500' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
        </article>
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