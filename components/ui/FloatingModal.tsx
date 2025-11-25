'use client'
import { Ban, Flag, Frown, PencilLine, Repeat2, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { Post, User } from "@/lib/types"
import Image from "next/image"
import DeleteConfirmation from "./DeleteConfirmation"

export default function FloatingModal({ tweet, tweetId, type, stat, onSelect, onClose, onDeleteSuccess }: { tweet?: Post, tweetId?: string, type?: string, stat?: 'like' | 'retweets' | 'quotes', onSelect?: (type: 'rt' | 'qrt') => void, onClose?: () => void, onDeleteSuccess?: () => void }) {
  const [currentUser, setCurrentUser] = useState<boolean | null>(null)
  const [tweetObj, setTweetObj] = useState<Post | null>(null)
  const [userList, setUserList] = useState<User[] | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  useEffect(() => {
    console.log('[FloatingModal] isDeleteConfirmOpen changed:', isDeleteConfirmOpen);
  }, [isDeleteConfirmOpen]);

  useEffect(() => {
    if (!onClose) return;

    const handleEsc = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() };

    const handleClickOutside = (event: MouseEvent) => {
      const modalEl = document.querySelector('.floating-modal');
      if (!modalEl) return;
      const target = event.target as Node | null;
      if (target && !modalEl.contains(target)) {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, type]);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    const isCurrentUser = storedUser === tweet?.author.username;
    console.log('[FloatingModal] Setting currentUser:', { storedUser, tweetAuthor: tweet?.author.username, isCurrentUser });
    const t = setTimeout(() => setCurrentUser(isCurrentUser), 0);
    return () => clearTimeout(t);
  }, [tweet?.author.username])

  useEffect(() => {
    async function fetchTweet() {
      if (!tweetId) return;
      const response = await fetch(`/api/post?tweetstats=${tweetId}`);
      const data = await response.json();
      setTweetObj(data as Post);
    }
    fetchTweet();
  }, [tweetId]);

  useEffect(() => {
    async function fetchUsers() {
      if (!stat || !tweetId) return;
      const response = await fetch(`/api/${stat}?id=${tweetId}`);
      const data = await response.json();
      setUserList(data as User[]);
    }
    fetchUsers();
  }, [stat, tweetId]);

  async function deleteTweet() {
    if (!tweet) {
      console.error('[FloatingModal] deleteTweet called but tweet is null');
      return;
    }
    
    const loggedUser = localStorage.getItem('loggedUser');
    
    console.log('[FloatingModal] deleteTweet - Starting delete:', { tweetId: tweet.tweetId, username: loggedUser });
    
    try {
      const response = await fetch('/api/post', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: tweet.tweetId, username: loggedUser })
      });

      console.log('[FloatingModal] deleteTweet - Response received:', { status: response.status, ok: response.ok });

      if (response.ok) {
        console.log('[FloatingModal] deleteTweet - SUCCESS! Calling callbacks');
        if (onDeleteSuccess) {
          console.log('[FloatingModal] deleteTweet - Calling onDeleteSuccess');
          onDeleteSuccess();
        }
        if (onClose) {
          console.log('[FloatingModal] deleteTweet - Calling onClose');
          onClose();
        }
        setIsDeleteConfirmOpen(false);
      } else {
        const error = await response.json();
        console.error('[FloatingModal] deleteTweet - FAILED:', { status: response.status, error });
        alert(error.message || 'Failed to delete tweet');
      }
    } catch (error) {
      console.error('[FloatingModal] deleteTweet - EXCEPTION:', error);
      alert('Failed to delete tweet: ' + String(error));
    }
  }

  const tweetOptions = [
    { icon: Frown, text: "Not interesting" },
    { icon: Ban, text: `Block @${tweet?.author.username}` },
    { icon: Flag, text: "Report tweet" }
  ]

  if (type === 'tweetOptions') return (
    <>
      <div className="floating-modal absolute top-0 right-0 w-60 bg-white text-gray-900 rounded-lg shadow z-9">
        {currentUser ? (
          <button
            onClick={(e) => { 
              console.log('[FloatingModal] Delete tweet button clicked!'); 
              e.stopPropagation(); 
              setIsDeleteConfirmOpen(true); 
            }}
            className="flex w-full px-4 py-3 font-semibold items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Trash className="w-5 h-5 flex-shrink-0 text-red-500" />
            Delete tweet
          </button>
        ) : (
          tweetOptions.map((option, _) => (
            <div key={_} className="flex px-4 py-3 font-semibold items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <option.icon className="w-5 h-5 flex-shrink-0" />
              {option.text}
            </div>
          ))
        )}
      </div>
      <DeleteConfirmation 
        isOpen={isDeleteConfirmOpen}
        onConfirm={() => {
          console.log('[FloatingModal] onConfirm called, calling deleteTweet');
          deleteTweet();
        }}
        onCancel={() => {
          console.log('[FloatingModal] onCancel called');
          setIsDeleteConfirmOpen(false);
        }}
      />
    </>
  )

  if (type === 'retweetOptions' && onSelect && onClose) return (
    <div className="floating-modal absolute top-0 right-0 w-37 bg-white text-gray-900 rounded-lg shadow z-9">
      <div className="flex px-4 py-3 font-semibold items-center gap-2" onClick={(e) => { e.stopPropagation(); onSelect('rt'); onClose(); }}>
        <Repeat2 className="w-5 h-5 flex-shrink-0" />
        Retweet
      </div>
      <div className="flex px-4 py-3 font-semibold items-center gap-2" onClick={(e) => { e.stopPropagation(); onSelect('qrt'); onClose(); }}>
        <PencilLine className="w-5 h-5 flex-shrink-0" />
        Quote Tweet
      </div>
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