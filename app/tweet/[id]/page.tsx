"use client";
import TweetDetail from "@/components/tweet/TweetDetail";

interface TweetPageProps {
  params: {
    id: string;
  };
}

export default function TweetPage({ params }: TweetPageProps) {
  return <TweetDetail tweetId={params.id} />;
}