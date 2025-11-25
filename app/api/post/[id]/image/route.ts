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