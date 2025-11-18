"use client";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import Image from "next/image";

export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const router = useRouter();
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    if (!storedUser || storedUser === 'none') {
      router.push('/');
      return;
    } else {
      const t = setTimeout(() => setLoggedUser(storedUser), 0);
      return () => clearTimeout(t);
    }
  }, [router])

  useEffect(() => {
    async function fetchUser(userId: string) {
      const response = await fetch('/api/user?id=' + userId);
      const data = await response.json();
      setCurrentUser(data as User);
      console.log(data);
    }
    if(loggedUser) fetchUser(loggedUser);
  }, [loggedUser])

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/50 backdrop-blur border-b border-gray-200 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {currentUser ?
              <Image src={'/img/' + currentUser.media.profileImage} className="size-7 bg-gray-300 rounded-full" width={28} height={28} alt="User avatar" />
            :
              <div className="size-7 bg-gray-300 rounded-full animate-pulse"></div>
            }
          </button>
          <h1 className="text-xl font-bold text-pink-600">XKW</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex w-full max-w-7xl mx-auto">
        {/* Left Sidebar - Fixed position */}
        <div className={`
          ${ isSidebarOpen ? 'translate-x-0' : '-translate-x-full' }
          md:translate-x-0 lg:translate-x-0 md:block
          fixed md:sticky top-0 left-0 h-screen z-50 md:z-0
          transition-transform duration-300 ease-in-out md:transition-none
        `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} user={currentUser} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen border-x border-gray-200">
          <div className="md:hidden h-15"></div>
          <div className="relative w-full">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}