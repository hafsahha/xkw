"use client";
import { Calendar, ImageIcon, MapPin, Smile, X } from "lucide-react";
import { useState } from "react";
import { User } from "@/lib/types";
import Image from "next/image";

export default function TweetComposer({ user, loading, onTweetPosted }: { user?: User, loading?: boolean, onTweetPosted?: () => void }) {
  const [tweetText, setTweetText] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const maxLength = 280;

  const uploadMedia = async (files: FileList) => {
    const uploadedMedia: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/post/${user!.username}/image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        uploadedMedia.push(data.filePath);
      } else {
        console.error("Failed to upload media:", file.name);
      }
    }

    return uploadedMedia;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetText.trim() || !user) return;

    setIsPosting(true);
    try {
      let uploadedMedia: string[] = [];
      if (images) {
        uploadedMedia = await uploadMedia(images);
      }

      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          content: tweetText,
          media: uploadedMedia,
          type: "Original",
        }),
      });

      if (response.ok) {
        await response.json();
        setTweetText("");
        setImages(null);
        setIsExpanded(false);

        if (onTweetPosted) onTweetPosted();
      } else {
        alert("Gagal posting tweet");
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsPosting(false);
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

  if (loading) {
    return (
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="size-10 bg-gray-300 rounded-full flex-shrink-0 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-6 mt-2 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border-b border-gray-200 p-4 ${isExpanded ? 'pb-2' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <Image src={`/img/${user!.media.avatar ?? "default_avatar.png"}`} alt={user!.name} className="size-10 rounded-full flex-shrink-0" width={40} height={40} />

          {/* Compose Area */}
          <div className="flex-1">
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's happening?"
              className="w-full pt-1 text-xl placeholder-gray-500 resize-none border-none outline-none bg-transparent"
              rows={isExpanded ? 3 : 1}
              maxLength={maxLength}
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
            
            {isExpanded && (
              <>
                {/* Options */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                  <div className="flex space-x-4">
                    <label className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                      <input
                        onChange={(e) => setImages(e.target.files)}
                        type="file" accept="image/*" multiple
                        className="hidden"
                      />
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                    </label>
                    <button
                      type="button"
                      className="text-pink-500 opacity-50 p-2 rounded-full transition-colors"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 opacity-50 p-2 rounded-full transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="text-pink-500 opacity-50 p-2 rounded-full transition-colors"
                    >
                      <MapPin className="h-5 w-5" />
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
                      disabled={!tweetText.trim() || tweetText.length > maxLength || isPosting}
                      className="bg-pink-500 text-white px-4 py-1.5 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
                    >
                      {isPosting ? "Posting..." : "Post"}
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