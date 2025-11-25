'use client';
import { useEffect, useState } from "react";
import { ChevronDown, Zap, Share2, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

export default function Landing() {
  const [loggedUser, setLoggedUser] = useState<string>('none');
  const [useroptions, setUseroptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api/user?limit=3');
      const data = await response.json();
      setUseroptions(data as User[]);
    }
    fetchUsers();
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser && storedUser !== 'none') {
      router.push('/home');
      return;
    }
    const t = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(t);
  }, [router])

  useEffect(() => {
    if (loggedUser !== 'none') {
      localStorage.setItem('loggedUser', loggedUser);
      router.push('/home');
    }
  }, [router, loggedUser])

  if (loading) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex flex-col items-center justify-center px-4">
      {/* Main Content */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Welcome to XKW</h1>
        <p className="text-xl text-gray-600 mb-8">Your gateway to seamless social interaction.</p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-md"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 border-2 border-pink-600 text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition-colors"
          >
            Create Account
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <Zap className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600 text-sm">Share your thoughts instantly with the community.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <Share2 className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Share</h3>
            <p className="text-gray-600 text-sm">Spread ideas and amplify your voice easily.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Engage</h3>
            <p className="text-gray-600 text-sm">Like, comment, and build meaningful connections.</p>
          </div>
        </div>
      </div>

      {/* Demo Login Section */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-center font-semibold text-gray-700 mb-4">
          Demo: Login as:
        </h2>
        <div className="relative inline-block w-full max-w-xs">
          <select
            value={loggedUser}
            onChange={(e) => setLoggedUser(e.target.value)}
            className="appearance-none w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="none">Select Demo User</option>
            {useroptions.map((user) => (
              <option key={user.username} value={user.username}>
                {user.username} (@{user.username})
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
            <ChevronDown size={16} />
          </span>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">For testing purposes only</p>
      </div>
    </div>
  );
}
