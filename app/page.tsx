'use client';
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">Welcome to XKW</h1>
          <p className="text-xl text-gray-600">Your gateway to seamless social interaction.</p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth/login"
            className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all hover:shadow-lg"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="inline-flex justify-center items-center px-8 py-3 border-2 border-pink-600 text-base font-semibold rounded-lg text-pink-600 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all hover:shadow-lg"
          >
            Create Account
          </a>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-pink-50 to-white text-gray-500">Or try demo account</span>
          </div>
        </div>

        {/* Demo Login Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quick Demo</h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Select a demo account to explore XKW instantly
          </p>
          <div>
            <label htmlFor="demo-user" className="block text-sm font-medium text-gray-700 mb-2">
              Demo User:
            </label>
            <div className="relative">
              <select
                id="demo-user"
                value={loggedUser}
                onChange={(e) => setLoggedUser(e.target.value)}
                className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer"
              >
                <option value="none">Select a demo account</option>
                {useroptions.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.name} (@{user.username})
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <ChevronDown size={18} />
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-pink-100 text-pink-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-22 0v2h2v-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Connect</h3>
            <p className="text-sm text-gray-600 mt-1">Follow and interact with users</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-pink-100 text-pink-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Share</h3>
            <p className="text-sm text-gray-600 mt-1">Post thoughts and ideas</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-pink-100 text-pink-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H2a2 2 0 01-2-2V8a2 2 0 012-2h2.4a1 1 0 00.894-.553l.448-.894A1 1 0 0110.464 4h3.072a2 2 0 011.789 2.894l-.448.894a1 1 0 00.894.553h2.4a2 2 0 012 2v1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Engage</h3>
            <p className="text-sm text-gray-600 mt-1">Like and retweet content</p>
          </div>
        </div>
      </div>
    </div>
  );
}
