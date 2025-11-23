import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const draftsCollection = database.collection("drafts");
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const draftId = searchParams.get('draftId');
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        
        if (draftId) {
            // Get specific draft
            const draft = await draftsCollection.findOne({ 
                _id: new ObjectId(draftId), 
                userId: new ObjectId(userId) 
            });
            
            if (!draft) {
                return NextResponse.json({ error: "Draft not found" }, { status: 404 });
            }
            
            return NextResponse.json({ draft });
        }
        
        // Get all drafts for user
        const drafts = await draftsCollection
            .find({ userId: new ObjectId(userId) })
            .sort({ updatedAt: -1 })
            .toArray();
            
        return NextResponse.json({ drafts, count: drafts.length });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching drafts", details: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const draftsCollection = database.collection("drafts");
        
        const body = await req.json();
        const { userId, content, media } = body;
        
        if (!userId || !content) {
            return NextResponse.json({ error: "User ID and content are required" }, { status: 400 });
        }
        
        const newDraft = {
            userId: new ObjectId(userId),
            content,
            media: media || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await draftsCollection.insertOne(newDraft);
        
        return NextResponse.json({ 
            message: "Draft created successfully", 
            draftId: result.insertedId 
        }, { status: 201 });
        
    } catch (error) {
        return NextResponse.json({ error: "Error creating draft", details: error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const draftsCollection = database.collection("drafts");
        
        const body = await req.json();
        const { draftId, userId, content, media } = body;
        
        if (!draftId || !userId) {
            return NextResponse.json({ error: "Draft ID and User ID are required" }, { status: 400 });
        }
        
        const updateData: any = { updatedAt: new Date() };
        if (content) updateData.content = content;
        if (media) updateData.media = media;
        
        const result = await draftsCollection.updateOne(
            { _id: new ObjectId(draftId), userId: new ObjectId(userId) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Draft not found" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Draft updated successfully" });
        
    } catch (error) {
        return NextResponse.json({ error: "Error updating draft", details: error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const draftsCollection = database.collection("drafts");
        
        const { searchParams } = new URL(req.url);
        const draftId = searchParams.get('draftId');
        const userId = searchParams.get('userId');
        
        if (!draftId || !userId) {
            return NextResponse.json({ error: "Draft ID and User ID are required" }, { status: 400 });
        }
        
        const result = await draftsCollection.deleteOne({ 
            _id: new ObjectId(draftId), 
            userId: new ObjectId(userId) 
        });
        
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Draft not found" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Draft deleted successfully" });
        
    } catch (error) {
        return NextResponse.json({ error: "Error deleting draft", details: error }, { status: 500 });
    }
}