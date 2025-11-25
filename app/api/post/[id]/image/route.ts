import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const fileName = `${id}-${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Ensure the upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Save the file to the upload directory
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, fileBuffer);

        return NextResponse.json({ message: "File uploaded successfully", filePath: `/uploads/${fileName}` });
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ message: "Failed to upload file", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { mediaUrls } = body;

        if (!mediaUrls || !Array.isArray(mediaUrls)) {
            return NextResponse.json({ message: "No media URLs provided" }, { status: 400 });
        }

        // Delete each media file
        for (const mediaUrl of mediaUrls) {
            try {
                // Extract filename from URL (e.g., /uploads/filename.jpg -> filename.jpg)
                let fileName = mediaUrl;
                if (mediaUrl.includes('/')) {
                    fileName = mediaUrl.split('/').pop() || mediaUrl;
                }
                
                const filePath = path.join(uploadDir, fileName);
                
                // Check if file exists before deleting
                try {
                    await fs.access(filePath);
                    await fs.unlink(filePath);
                    console.log(`[DELETE /api/post/[id]/image] Deleted file: ${fileName}`);
                } catch (accessError) {
                    console.warn(`[DELETE /api/post/[id]/image] File not found, skipping: ${fileName}`);
                    // Don't fail if file doesn't exist, just skip it
                }
            } catch (error) {
                console.error(`[DELETE /api/post/[id]/image] Error deleting ${mediaUrl}:`, error);
                // Continue deleting other files even if one fails
            }
        }

        return NextResponse.json({ message: "Media files deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("[DELETE /api/post/[id]/image] ERROR:", error);
        return NextResponse.json({ message: "Failed to delete media files", error: String(error) }, { status: 500 });
    }
}