"use client";

import { useState, useEffect } from "react";
import { ImageIcon, X } from "lucide-react";
import { createPortal } from "react-dom";
import { User } from "@/lib/types";
import Image from "next/image";

export default function NewPostModal({ isOpen, user, onClose, onTweetPosted }: { isOpen: boolean; user: User | null; onClose: () => void; onTweetPosted?: () => void }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPosting, setIsPosting] = useState(false); // Track posting state

  const maxCharacters = 280;
  const remainingCharacters = maxCharacters - content.length;

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) {
      alert("User data or content is missing.");
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          content,
          media: images ? Array.from(images).map((file) => file.name) : [],
          type: "Original",
        }),
      });

      if (response.ok) {
        await response.json();
        setContent("");
        setImages(null);
        onClose();

        if (onTweetPosted) onTweetPosted();
      } else {
        const errorData = await response.json();
        console.error("Failed to post tweet:", errorData);
        alert(`Failed to post tweet: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("An error occurred while posting the tweet. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen || !mounted) return null;
  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
      suppressHydrationWarning={true}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl"
        suppressHydrationWarning={true}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4" suppressHydrationWarning={true}>
          <div className="flex space-x-3" suppressHydrationWarning={true}>
            {/* User Avatar */}
            <div className="flex-shrink-0" suppressHydrationWarning={true}>
              {user ? (
                <Image
                  src={`/img/${user.media.avatar ?? "default_avatar.png"}`} alt={user.name}
                  width={40} height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div
                  className="w-10 h-10 bg-gray-300 rounded-full"
                  suppressHydrationWarning={true}
                ></div>
              )}
            </div>

            {/* Post Content */}
            <div className="flex-1" suppressHydrationWarning={true}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full text-xl placeholder-gray-500 border-none outline-none resize-none bg-transparent"
                rows={4}
                maxLength={maxCharacters}
                autoFocus
              />

              {/* Image Preview */}
              {images && images.length > 0 && (
                <div className="mt-3" suppressHydrationWarning={true}>
                  <div
                    className="grid grid-cols-2 gap-2 max-w-md"
                    suppressHydrationWarning={true}
                  >
                    {Array.from(images).map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          width={180} height={128}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = Array.from(images).filter((_, i) => i !== index);
                            const dt = new DataTransfer();
                            newFiles.forEach((file) => dt.items.add(file));
                            setImages(dt.files);
                          }}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Actions */}
          <div
            className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200"
            suppressHydrationWarning={true}
          >
            <div
              className="flex items-center space-x-4"
              suppressHydrationWarning={true}
            >
              {/* Image Upload */}
              <label className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                <input
                  onChange={(e) => setImages(e.target.files)}
                  type="file" accept="image/*" multiple
                  className="hidden"
                />
                <ImageIcon className="w-5 h-5 text-pink-500" />
              </label>
            </div>

            <div
              className="flex items-center space-x-3"
              suppressHydrationWarning={true}
            >
              {/* Character Count */}
              <div
                className={`text-sm ${
                  remainingCharacters < 0
                    ? "text-red-500"
                    : remainingCharacters < 20
                    ? "text-yellow-500"
                    : "text-gray-500"
                }`}
                suppressHydrationWarning={true}
              >
                {remainingCharacters < 0 ? remainingCharacters : ""}
              </div>

              {/* Post Button */}
              <button
                type="submit"
                disabled={!content.trim() || remainingCharacters < 0 || isPosting}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  content.trim() && remainingCharacters >= 0 && !isPosting
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}