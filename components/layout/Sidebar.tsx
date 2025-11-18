"use client";
import { Bell, Bookmark, House, Plus, Search, User2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { User } from "@/lib/types";
import NewPostModal from "@/components/NewPostModal";
import Link from "next/link";
import Image from "next/image";

const navigationItems = [
  { name: "Home", href: "/home", icon: House },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Profile", href: "/profile", icon: User2 },
];

export default function Sidebar({ onClose, user }: { onClose?: () => void, user: User | null }) {
  const pathname = usePathname();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  return (
    <aside className="lg:w-64 md:w-20 w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Close button for mobile */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-pink-600">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col h-full p-4 md:p-2 lg:p-4">
        {/* Logo - Hidden on mobile since it's in the header */}
        <div className="hidden lg:block mb-8">
          <Link href="/home" className="text-3xl font-bold text-pink-500">
            XKW
          </Link>
        </div>
        
        {/* Logo Icon for md screens */}
        <div className="hidden md:block lg:hidden mb-8 text-center">
          <Link href="/home" className="text-2xl font-bold text-pink-500">
            X
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center md:justify-center lg:justify-start space-x-4 lg:space-x-4 md:space-x-0 px-4 md:px-2 lg:px-4 py-3 rounded-full transition-colors group
                  ${isActive 
                    ? 'bg-pink-50 text-pink-600 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={item.name}
              >
                <Icon className="w-6 h-6" />
                <span className="text-lg md:hidden lg:block">{item.name}</span>
              </Link>
            );
          })}

          {/* Tweet Button */}
          <button 
            onClick={() => setIsNewPostOpen(true)}
            className="w-full md:w-12 md:h-12 lg:w-full lg:h-auto bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 md:p-3 lg:px-6 lg:py-3 rounded-full transition-colors flex items-center justify-center space-x-2 md:space-x-0 lg:space-x-2 mt-6"
            title="New Post"
          >
            <Plus className="w-6 h-6" />
            <span className="md:hidden lg:block">New Post</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="mt-auto space-y-4">
          {user ? (
            <div className="p-3 md:p-2 lg:p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="flex items-center md:justify-center lg:justify-start space-x-3 md:space-x-0 lg:space-x-3">
                <Image className="size-10 flex-shrink-0 rounded-full" src={`/img/${user.media.profileImage}`} alt="User Profile" width={40} height={40} />
                <div className="flex-1 min-w-0 md:hidden lg:block">
                  <p className="font-semibold text-sm truncate text-black">{user.name}</p>
                  <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 md:p-2 lg:p-3 rounded-xl transition-colors animate-pulse">
              <div className="flex items-center md:justify-center lg:justify-start space-x-3 md:space-x-0 lg:space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 min-w-0 md:hidden lg:block">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          )}
          
          {/* Auth Links */}
          <div className="flex md:flex-col lg:flex-row space-x-2 md:space-x-0 lg:space-x-2 md:space-y-2 lg:space-y-0">
            <Link 
              href="/auth/login" 
              className="flex-1 text-center py-2 px-4 md:px-2 lg:px-4 border border-pink-500 text-pink-500 rounded-full text-sm font-semibold hover:bg-pink-50 transition-colors"
              title="Login"
            >
              <span className="md:hidden lg:inline">Login</span>
              <span className="hidden md:inline lg:hidden">L</span>
            </Link>
            <Link 
              href="/auth/register" 
              className="flex-1 text-center py-2 px-4 md:px-2 lg:px-4 bg-pink-500 text-white rounded-full text-sm font-semibold hover:bg-pink-600 transition-colors"
              title="Register"
            >
              <span className="md:hidden lg:inline">Register</span>
              <span className="hidden md:inline lg:hidden">R</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* New Post Modal */}
      <NewPostModal 
        isOpen={isNewPostOpen} 
        onClose={() => setIsNewPostOpen(false)} 
      />
    </aside>
  );
}