"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NewPostModal from "@/components/NewPostModal";

interface SidebarProps {
  onClose?: () => void;
}

// Custom SVG Icons
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const navigationItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Explore", href: "/explore", icon: MagnifyingGlassIcon },
  { name: "Notifications", href: "/notifications", icon: BellIcon },
  { name: "Bookmarks", href: "/bookmarks", icon: BookmarkIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export default function Sidebar({ onClose }: SidebarProps) {
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
          <Link href="/" className="text-3xl font-bold text-pink-500">
            XKW
          </Link>
        </div>
        
        {/* Logo Icon for md screens */}
        <div className="hidden md:block lg:hidden mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-pink-500">
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
            className="w-full md:w-12 md:h-12 lg:w-full lg:h-auto bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 md:p-3 lg:px-6 lg:py-3 rounded-full transition-colors flex items-center justify-center space-x-2 md:space-x-0 lg:space-x-2 mt-6"
            title="New Post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="md:hidden lg:block">New Post</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="mt-auto space-y-4">
          <div className="p-3 md:p-2 lg:p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="flex items-center md:justify-center lg:justify-start space-x-3 md:space-x-0 lg:space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 min-w-0 md:hidden lg:block">
                <p className="font-semibold text-sm truncate text-black">Username</p>
                <p className="text-gray-500 text-sm truncate">@username</p>
              </div>
            </div>
          </div>
          
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