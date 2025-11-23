import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    const database = await db;
    const usersCollection = database?.collection("users");

    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");
    const limit = searchParams.get("limit");

    if (usersCollection) {
        if (username) {
            const userDoc = await usersCollection.findOne({ username: username });
            if (userDoc) {
                const { _id, password, ...serializedUser } = userDoc;

                // Ensure followers and following fields are included with default values
                serializedUser.followers = serializedUser.followers || [];
                serializedUser.following = serializedUser.following || [];

                return NextResponse.json(serializedUser);
            }
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }
        const allUsers = await usersCollection.find({}).limit(limit ? parseInt(limit) : 100).toArray();
        const serializedUsers = allUsers.map(({ _id, password, ...rest }) => ({
            ...rest,
            followers: rest.followers || [],
            following: rest.following || [],
        }));
        return NextResponse.json(serializedUsers);
    }

}

export async function PATCH(req: NextRequest) {
    const database = await db;
    const usersCollection = database?.collection("users");

    const body = await req.json();
    const { follower, followee } = body;

    if (!follower || !followee) {
        return NextResponse.json({ error: "Missing follower or followee ID" }, { status: 400 });
    }

    if (usersCollection) {
        const followeeDoc = await usersCollection.findOne({ username: followee });
        const followerDoc = await usersCollection.findOne({ username: follower });

        if (!followeeDoc || !followerDoc) {
            return NextResponse.json({ error: "Invalid follower or followee" }, { status: 400 });
        }

        const isFollowing = followeeDoc.followers?.includes(follower);

        if (isFollowing) {
            // Unfollow
            await usersCollection.updateOne(
                { username: followee },
                { $pull: { followers: follower } }
            );
            await usersCollection.updateOne(
                { username: follower },
                { $pull: { following: followee } }
            );
            return NextResponse.json({ message: "Unfollowed successfully" });
        } else {
            // Follow
            await usersCollection.updateOne(
                { username: followee },
                { $addToSet: { followers: follower } }
            );
            await usersCollection.updateOne(
                { username: follower },
                { $addToSet: { following: followee } }
            );
            return NextResponse.json({ message: "Followed successfully" });
        }
    }

    return NextResponse.json({ error: "Database error" }, { status: 500 });
}