import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        const usersCollection = database?.collection("users");

        if (!usersCollection) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }

        // Get total count of users
        const totalUsers = await usersCollection.countDocuments();
        
        // Get first 5 users for debugging
        const sampleUsers = await usersCollection
            .find({})
            .limit(5)
            .project({ password: 0 }) // Exclude passwords for security
            .toArray();

        // Get user creation info
        const userStats = await usersCollection.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    oldestUser: { $min: "$createdAt" },
                    newestUser: { $max: "$createdAt" }
                }
            }
        ]).toArray();

        return NextResponse.json({
            status: "Database connection successful",
            totalUsers,
            sampleUsers: sampleUsers.map(user => ({
                _id: user._id,
                username: user.username,
                name: user.name,
                createdAt: user.createdAt,
                followers: user.followers?.length || 0,
                following: user.following?.length || 0
            })),
            userStats: userStats[0] || {},
            timestamp: new Date()
        });

    } catch (error) {
        console.error("[DEBUG] Database error:", error);
        return NextResponse.json({ 
            error: "Database error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}