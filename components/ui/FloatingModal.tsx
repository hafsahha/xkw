'use client'
import { Ban, Flag, Frown, Trash } from "lucide-react"
import { useEffect, useState, ReactNode } from "react"
import { Post } from "@/lib/types"

export default function FloatingModal({ 
  tweet, 
  type, 
  onClose, 
  children, 
  isOpen 
}: { 
  tweet?: Post, 
  type?: string, 
  onClose?: () => void,
  children?: ReactNode,
  isOpen?: boolean
}) {
  const [currentUser, setCurrentUser] = useState<boolean | null>(null)

  useEffect(() => {
    if (!tweet?.author?.username) return;
    
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setCurrentUser(storedUser === tweet.author.username), 0);
    return () => clearTimeout(t);
  }, [tweet?.author?.username])

  async function deleteTweet() {
    const response = fetch('/api/post', {
      method: 'DELETE'
    })
    // not finished yet
  }

  const tweetOptions = [
    { icon: Frown, text: "Not interesting" },
    { icon: Ban, text: `Block @${tweet.author.username}` },
    { icon: Flag, text: "Report tweet" }
  ]

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-60 bg-white text-gray-900 rounded-lg shadow z-9">
      {children || (
        type === 'tweetOptions' && (
          <>
            {currentUser ? (
              <button
                onClick={deleteTweet}
                className="flex w-full px-4 py-3 font-semibold items-center gap-2"
              >
                <Trash className="w-5 h-5 flex-shrink-0 text-red-500" />
                Delete tweet
              </button>
            ) : (
              tweetOptions.map((option, _) => (
                <div key={_} className="flex px-4 py-3 font-semibold items-center gap-2">
                  <option.icon className="w-5 h-5 flex-shrink-0" />
                  {option.text}
                </div>
              ))
            )}
          </>
        )
      )}
    </div>
  )
}