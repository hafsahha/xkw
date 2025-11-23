"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import { X } from "lucide-react";
import { Post } from "@/lib/types";
import Image from "next/image";

interface QuoteTweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTweet: Post;
  currentUser: string | null; // Izinkan null biar tidak error type
  onQuoteSuccess?: () => void;
}

export default function QuoteTweetModal({ isOpen, onClose, originalTweet, currentUser, onQuoteSuccess }: QuoteTweetModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pastikan komponen sudah mount di browser (untuk menghindari error hydration pada Portal)
  useEffect(() => {
    setMounted(true);
    // Disable scroll pada body saat modal terbuka
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Jika belum mount atau tidak open, jangan render apa-apa
  if (!mounted || !isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim() || !currentUser) return;
    
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

  // Gunakan createPortal untuk "melempar" modal ke body
  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-16 z-[9999]">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto relative z-10 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-20">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Tombol Submit di Header (Style Twitter Asli) */}
          <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-black hover:bg-gray-800 disabled:bg-opacity-50 text-white px-5 py-1.5 rounded-full font-bold text-sm transition-colors"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
             {/* Avatar User yang sedang login (Optional, kalau ada datanya) */}
             <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                {/* Placeholder avatar current user */}
                <div className="w-full h-full bg-gray-300"></div>
             </div>

             <div className="flex-1">
                {/* Quote input */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full text-lg placeholder-gray-500 border-none focus:ring-0 resize-none outline-none min-h-[80px]"
                  autoFocus
                />

                {/* Original tweet Card */}
                <div className="mt-2 border border-gray-200 rounded-2xl p-3 hover:bg-gray-50 transition-colors cursor-pointer select-none">
                  <div className="flex gap-2 items-center mb-1">
                     <Image 
                      src={'/img/' + originalTweet.author.avatar} 
                      alt={originalTweet.author.name} 
                      className="size-5 rounded-full flex-shrink-0" 
                      width={20} 
                      height={20} 
                    />
                    <span className="font-bold text-[#0f1419] text-sm">{originalTweet.author.name}</span>
                    <span className="text-gray-500 text-sm">@{originalTweet.author.username}</span>
                    <span className="text-gray-500 text-sm">·</span>
                    <span className="text-gray-500 text-sm">{formatTime(originalTweet.createdAt)}</span>
                  </div>
                  
                  <div className="text-[15px] text-[#0f1419]">
                     {originalTweet.content}
                  </div>
                  
                  {/* Original tweet media */}
                  {originalTweet.media && originalTweet.media.length > 0 && (
                    <div className="mt-2">
                      <Image
                        src={'/img/' + originalTweet.media[0]}
                        alt="Tweet media"
                        className="rounded-xl max-h-48 object-cover w-full border border-gray-200"
                        width={400}
                        height={200}
                      />
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body // Target Portal
  );
}