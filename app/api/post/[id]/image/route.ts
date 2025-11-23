import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const database = await db;
    const tweetCollection = database.collection("tweets");
    const searchParams = req.nextUrl.searchParams;
    const index = searchParams.get("index");
    const { id } = await params;

    if (tweetCollection && index !== null) {
        const tweet = await tweetCollection.findOne({ tweetId: id });
        if (tweet && tweet.media && tweet.media.length >= parseInt(index)) {
            return NextResponse.json({ photoUrl: tweet.media[parseInt(index) - 1] });
        }
        return NextResponse.json({ photoUrl: null });
    }
    return NextResponse.json({ photoUrl: null });
}