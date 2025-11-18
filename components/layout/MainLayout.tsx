"use client";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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
        ></div>
      )}

      <div className="flex w-full max-w-7xl mx-auto">
        {/* Left Sidebar - Fixed position */}
        <div className={`
          ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }
          md:translate-x-0 lg:translate-x-0 md:block
          fixed md:sticky top-0 left-0 h-screen z-50 md:z-0
          transition-transform duration-300 ease-in-out md:transition-none
        `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen border-x border-gray-200 max-w-2xl">
          <div className="md:hidden h-16"></div>
          <div className="w-full overflow-hidden">
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