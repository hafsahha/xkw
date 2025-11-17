import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <div className="flex max-w-6xl mx-auto" suppressHydrationWarning>
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 max-w-2xl min-h-screen border-x border-gray-200 md:ml-0 ml-0">
          <div className="md:hidden h-16" suppressHydrationWarning></div> {/* Spacer for mobile header */}
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}