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
    <div className="h-screen flex items-center justify-center gap-4 flex-col dark:text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to XKW</h1>
        <p className="text-lg text-gray-600">Your gateway to seamless social interaction.</p>
      </div>
      <div>
        <h2>
          Login as:
        </h2>
        <div className="relative inline-block">
          <select
            value={loggedUser}
            onChange={(e) => setLoggedUser(e.target.value)}
            className="appearance-none pr-10 pl-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="0">Select User</option>
            {useroptions.map((user) => (
              <option key={user.username} value={user.username}>
                {user.username} (@{user.username})
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
            <ChevronDown size={16} />
          </span>
        </div>
      </div>
    </div>
  );
}
