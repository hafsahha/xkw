import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const hashtagsCollection = database.collection("hashtags");
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const trending = searchParams.get('trending') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');
        
        if (trending) {
            // Get trending hashtags (most used recently)
            const trendingHashtags = await hashtagsCollection
                .find({})
                .sort({ count: -1, lastUsed: -1 })
                .limit(limit)
                .toArray();
                
            return NextResponse.json({ hashtags: trendingHashtags, type: 'trending' });
        }
        
        if (search) {
            // Search hashtags
            const searchRegex = new RegExp(search, 'i');
            const searchResults = await hashtagsCollection
                .find({ _id: searchRegex } as any)
                .sort({ count: -1 })
                .limit(limit)
                .toArray();
                
            return NextResponse.json({ hashtags: searchResults, search });
        }
        
        // Get all hashtags
        const allHashtags = await hashtagsCollection
            .find({})
            .sort({ count: -1 })
            .limit(limit)
            .toArray();
            
        return NextResponse.json({ hashtags: allHashtags });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching hashtags", details: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const hashtagsCollection = database.collection("hashtags");
        
        const body = await req.json();
        const { hashtags } = body; // Array of hashtag strings
        
        if (!Array.isArray(hashtags) || hashtags.length === 0) {
            return NextResponse.json({ error: "Hashtags array is required" }, { status: 400 });
        }
        
        const updates = hashtags.map(tag => ({
            updateOne: {
                filter: { _id: tag.toLowerCase() },
                update: { 
                    $inc: { count: 1 },
                    $set: { lastUsed: new Date() }
                },
                upsert: true
            }
        }));
        
        const result = await hashtagsCollection.bulkWrite(updates);
        
        return NextResponse.json({ 
            message: "Hashtags updated successfully",
            upsertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Error updating hashtags", details: error }, { status: 500 });
    }
}

// Helper function to extract hashtags from text
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;
        
        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }
        
        // Extract hashtags from text
        const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;
        const hashtags = text.match(hashtagRegex) || [];
        const cleanHashtags = hashtags.map((tag: string) => tag.slice(1).toLowerCase());
        
        if (cleanHashtags.length > 0) {
            // Update hashtag counts
            const database = await db;
            if (database) {
                const hashtagsCollection = database.collection("hashtags");
                
                const updates = cleanHashtags.map((tag: string) => ({
                    updateOne: {
                        filter: { _id: tag },
                        update: { 
                            $inc: { count: 1 },
                            $set: { lastUsed: new Date() }
                        },
                        upsert: true
                    }
                }));
                
                await hashtagsCollection.bulkWrite(updates);
            }
        }
        
        return NextResponse.json({ 
            extractedHashtags: cleanHashtags,
            count: cleanHashtags.length
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Error extracting hashtags", details: error }, { status: 500 });
    }
}