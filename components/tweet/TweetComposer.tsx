"use client";

import { useState } from "react";

// Custom SVG Icons
const PhotoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const GifIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.75 8.25v7.5m6-7.5h-3V9m0 0v1.5m0-1.5h1.5m-1.5 0H15m-3.75-1.5v1.5m0 0v1.5m0-1.5H9.75M8.25 15.75V12m0 0V9m0 3h3.75M3.75 12h16.5" />
  </svg>
);

const FaceSmileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export default function TweetComposer() {
  const [tweetText, setTweetText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 280;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweetText.trim()) {
      // TODO: Implement tweet posting logic
      console.log("Posting tweet:", tweetText);
      setTweetText("");
      setIsExpanded(false);
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

  return (
    <div className="border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
          
          {/* Compose Area */}
          <div className="flex-1">
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's happening?"
              className="w-full text-xl placeholder-gray-500 resize-none border-none outline-none bg-transparent"
              rows={isExpanded ? 3 : 1}
              maxLength={maxLength}
            />
            
            {isExpanded && (
              <>
                {/* Options */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    >
                      <PhotoIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    >
                      <GifIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 hover:bg-pink-50 p-2 rounded-full transition-colors"
                    >
                      <MapPinIcon className="h-5 w-5" />
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
                      disabled={!tweetText.trim() || tweetText.length > maxLength}
                      className="bg-pink-500 text-white px-4 py-1.5 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
                    >
                      Post
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