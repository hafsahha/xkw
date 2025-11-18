import { Post } from "@/lib/types";
import TweetCard from "./TweetCard";

export default function TweetFeed({ tweets, loading = false }: { tweets?: Post[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="divide-y divide-gray-200">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="flex space-x-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="flex space-x-8 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-300 rounded w-8"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tweets!.map((tweet, _) => <TweetCard key={_} tweet={tweet} />)}
    </div>
  );
}