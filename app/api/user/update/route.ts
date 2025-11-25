import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(req: NextRequest) {
    const database = await db;
    const usersCollection = database?.collection("users");

    if (usersCollection) {
        const body = await req.json();
        const { username, name, bio, location, website, avatar, banner } = body;
        
        if (!username) {
            return NextResponse.json({ message: "Username is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;
        
        // Update media object
        if (avatar !== undefined || banner !== undefined) {
            const user = await usersCollection.findOne({ username });
            const currentMedia = user?.media || {};
            updateData.media = {
                ...currentMedia,
                ...(avatar !== undefined && { avatar }),
                ...(banner !== undefined && { banner })
            };
        }

        const result = await usersCollection.updateOne(
            { username },
            { $set: updateData }
        );

        if (result.modifiedCount > 0) {
            return NextResponse.json({ message: "Profile updated successfully" });
        } else {
            return NextResponse.json({ message: "No changes made or user not found" }, { status: 404 });
        }
    }

    return NextResponse.json({ error: "Database error" }, { status: 500 });
}