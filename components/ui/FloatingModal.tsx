'use client'
import { Ban, Flag, Frown, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { Post, User } from "@/lib/types"
import Image from "next/image"

export default function FloatingModal({ tweet, tweetId, type, stat, onClose }: { tweet?: Post, tweetId?: string, type?: string, stat?: 'like' | 'retweets' | 'quotes', onClose?: () => void }) {
  const [currentUser, setCurrentUser] = useState<boolean | null>(null)
  const [tweetObj, setTweetObj] = useState<Post | null>(null)
  const [userList, setUserList] = useState<User[] | null>(null)

  useEffect(() => {
    if (onClose) {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [onClose]);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const t = setTimeout(() => setCurrentUser(storedUser === tweet?.author.username), 0);
    return () => clearTimeout(t);
  }, [tweet?.author.username])

  useEffect(() => {
    async function fetchTweet() {
      const response = await fetch(`/api/post?tweetstats=${tweetId}`);
      const data = await response.json();
      setTweetObj(data as Post);
    }
    fetchTweet();
  }, [tweetId]);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch(`/api/${stat}?id=${tweetId}`);
      const data = await response.json();
      setUserList(data as User[]);
    }
    fetchUsers();
  }, [stat, tweetId]);

  async function deleteTweet() {
    const response = fetch('/api/post', {
      method: 'DELETE'
    })
    // not finished yet
  }

  const tweetOptions = [
    { icon: Frown, text: "Not interesting" },
    { icon: Ban, text: `Block @${tweet?.author.username}` },
    { icon: Flag, text: "Report tweet" }
  ]

  if (type === 'tweetOptions') return (
    <div className="absolute top-0 right-0 w-60 bg-white text-gray-900 rounded-lg shadow z-9">
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
    </div>
  )

  if (type === 'statsList' && tweetObj && userList) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-1/2 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {stat === 'like' ? 'Liked by' : stat === 'retweets' ? 'Retweeted by' : 'Quoted by'}
          </h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {userList.map((user) => (
            <li key={user.username} className="flex items-center gap-2 p-2 border-b border-gray-200">
              <Image
                src={`/img/${user.media.avatar ?? "default-avatar.png"}`} alt={user.name}
                width={32} height={32}
                className="w-8 h-8 rounded-full"
              />
              <span>{user.name} (@{user.username})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}