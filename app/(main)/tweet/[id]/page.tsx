"use client";
import React, { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import TweetDetail from "@/components/tweet/TweetDetail";

export default function TweetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [tweet, setTweet] = useState<Post | null>(null);
  
  useEffect(() => {
    async function fetchTweet() {
      const response = await fetch('/api/post?id=' + id);
      const data = await response.json();
      setTweet(data as Post);
    }
    fetchTweet();
  }, [id]);

  return tweet ? <TweetDetail tweet={tweet} /> : <TweetDetail loading />;
}