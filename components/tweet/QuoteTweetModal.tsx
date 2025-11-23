"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Post } from "@/lib/types";
import Image from "next/image";

interface QuoteTweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTweet: Post;
  currentUser: string;
  onQuoteSuccess?: () => void;
}

export default function QuoteTweetModal({ isOpen, onClose, originalTweet, currentUser, onQuoteSuccess }: QuoteTweetModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          content: content.trim(),
          type: "Quote",
          refId: originalTweet.tweetId
        })
      });

      if (response.ok) {
        setContent("");
        onClose();
        if (onQuoteSuccess) {
          onQuoteSuccess();
        }
      } else {
        console.error("Failed to create quote tweet");
      }
    } catch (error) {
      console.error("Quote tweet error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Quote Tweet</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Quote input */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={280}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/280
            </div>
          </div>

          {/* Original tweet */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex space-x-3">
              <Image 
                src={'/img/' + originalTweet.author.avatar} 
                alt={originalTweet.author.name} 
                className="size-8 rounded-full flex-shrink-0" 
                width={32} 
                height={32} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 text-sm">
                  <span className="font-semibold text-gray-900">{originalTweet.author.name}</span>
                  <span className="text-gray-500">@{originalTweet.author.username}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{formatTime(originalTweet.createdAt)}</span>
                </div>
                <p className="text-gray-900 mt-1">{originalTweet.content}</p>
                
                {/* Original tweet media */}
                {originalTweet.media && originalTweet.media.length > 0 && (
                  <div className="mt-2">
                    <Image
                      src={'/img/' + originalTweet.media[0]}
                      alt="Tweet media"
                      className="rounded-lg max-h-48 object-cover w-full"
                      width={400}
                      height={200}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-medium disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Quote Tweet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}