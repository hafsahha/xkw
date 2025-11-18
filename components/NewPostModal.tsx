"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const maxCharacters = 280;
  const remainingCharacters = maxCharacters - content.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      // Here you would typically send the post to your backend
      console.log("Posting:", content);
      setContent("");
      setImages(null);
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
      suppressHydrationWarning={true}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl" suppressHydrationWarning={true}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4" suppressHydrationWarning={true}>
          <div className="flex space-x-3" suppressHydrationWarning={true}>
            {/* User Avatar */}
            <div className="flex-shrink-0" suppressHydrationWarning={true}>
              <div className="w-12 h-12 bg-gray-300 rounded-full" suppressHydrationWarning={true}></div>
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
                  <div className="grid grid-cols-2 gap-2 max-w-md" suppressHydrationWarning={true}>
                    {Array.from(images).map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = Array.from(images).filter((_, i) => i !== index);
                            const dt = new DataTransfer();
                            newFiles.forEach(file => dt.items.add(file));
                            setImages(dt.files);
                          }}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200" suppressHydrationWarning={true}>
            <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
              {/* Image Upload */}
              <label className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>

              {/* Emoji */}
              <button type="button" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Poll */}
              <button type="button" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              {/* GIF */}
              <button type="button" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-3" suppressHydrationWarning={true}>
              {/* Character Count */}
              <div className={`text-sm ${
                remainingCharacters < 0 
                  ? 'text-red-500' 
                  : remainingCharacters < 20 
                    ? 'text-yellow-500' 
                    : 'text-gray-500'
              }`} suppressHydrationWarning={true}>
                {remainingCharacters < 0 ? remainingCharacters : ''}
              </div>

              {/* Character Circle Progress */}
              <div className="relative w-8 h-8" suppressHydrationWarning={true}>
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-gray-200"
                    fill="none"
                    strokeWidth="2"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`stroke-current ${
                      remainingCharacters < 0 
                        ? 'text-red-500' 
                        : remainingCharacters < 20 
                          ? 'text-yellow-500' 
                          : 'text-pink-500'
                    }`}
                    fill="none"
                    strokeWidth="2"
                    strokeDasharray={`${((maxCharacters - Math.abs(remainingCharacters)) / maxCharacters) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              {/* Post Button */}
              <button
                type="submit"
                disabled={!content.trim() || remainingCharacters < 0}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  content.trim() && remainingCharacters >= 0
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}