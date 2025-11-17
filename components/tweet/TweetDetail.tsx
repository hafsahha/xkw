"use client";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

interface TweetDetailProps {
  tweetId: string;
}

export default function TweetDetail({ tweetId }: TweetDetailProps) {
  const [tweet] = useState({
    id: tweetId,
    author: { name: "John Doe", username: "johndoe" },
    content: "This is a sample tweet that you clicked on to see the details and replies!",
    createdAt: new Date().toISOString(),
    stats: { likes: 45, retweets: 12, quotes: 3, replies: 8 }
  });

  const [replies] = useState([
    {
      id: "1",
      author: { name: "Alice Smith", username: "alicesmith" },
      content: "Great tweet! I totally agree with this.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      stats: { likes: 5, retweets: 1, quotes: 0, replies: 2 }
    },
    {
      id: "2", 
      author: { name: "Bob Johnson", username: "bobjohnson" },
      content: "Thanks for sharing this insight. Really helpful!",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      stats: { likes: 3, retweets: 0, quotes: 0, replies: 1 }
    }
  ]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d`;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-black">Post</h1>
        </div>
      </div>

      {/* Main Tweet */}
      <article className="p-4 border-b border-gray-200">
        <div className="flex space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-2">
              <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                {tweet.author.name}
              </h3>
              <span className="text-gray-500">@{tweet.author.username}</span>
            </div>
            <div className="mb-4">
              <p className="text-gray-900 text-lg leading-relaxed">{tweet.content}</p>
            </div>
            <div className="text-gray-500 text-sm mb-4">
              {new Date(tweet.createdAt).toLocaleTimeString()} · {new Date(tweet.createdAt).toLocaleDateString()}
            </div>
            
            {/* Interaction Stats */}
            <div className="flex items-center space-x-6 py-3 border-t border-b border-gray-200 text-gray-500 text-sm">
              <span><span className="font-semibold text-gray-900">{tweet.stats.retweets}</span> Retweets</span>
              <span><span className="font-semibold text-gray-900">{tweet.stats.quotes}</span> Quote Tweets</span>
              <span><span className="font-semibold text-gray-900">{tweet.stats.likes}</span> Likes</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around py-3 border-b border-gray-200">
              <button className="p-2 hover:bg-pink-50 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-green-50 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <button className="p-2 hover:bg-red-50 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Reply Form */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
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
        {replies.map((reply) => (
          <article key={reply.id} className="p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                    {reply.author.name}
                  </h3>
                  <span className="text-gray-500">@{reply.author.username}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{formatTime(reply.createdAt)}</span>
                </div>
                <div className="mb-2">
                  <p className="text-gray-900">{reply.content}</p>
                </div>
                
                {/* Reply Actions */}
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">{reply.stats.replies}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="text-sm">{reply.stats.retweets}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{reply.stats.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </MainLayout>
  );
}