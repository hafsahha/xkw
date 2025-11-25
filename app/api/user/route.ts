import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { createHash } from "crypto";

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
                const { password, ...serializedUser } = userDoc;

                // Ensure followers and following fields are included with default values
                serializedUser.followers = serializedUser.followers || [];
                serializedUser.following = serializedUser.following || [];
                serializedUser.media = serializedUser.media || { avatar: "default_avatar.png", banner: "default_banner.png" };
                serializedUser.tweetCount = serializedUser.tweetCount || 0;
                serializedUser.likeCount = serializedUser.likeCount || 0;
                serializedUser.bookmarkCount = serializedUser.bookmarkCount || 0;
                serializedUser.retweetCount = serializedUser.retweetCount || 0;

                return NextResponse.json(serializedUser);
            }
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }
        const allUsers = await usersCollection.find({}).limit(limit ? parseInt(limit) : 100).toArray();
        const serializedUsers = allUsers.map(({ password, ...rest }) => ({
            ...rest,
            followers: rest.followers || [],
            following: rest.following || [],
            media: rest.media || { avatar: "default_avatar.png", banner: "default_banner.png" },
            tweetCount: rest.tweetCount || 0,
            likeCount: rest.likeCount || 0,
            bookmarkCount: rest.bookmarkCount || 0,
            retweetCount: rest.retweetCount || 0,
        }));
        return NextResponse.json(serializedUsers);
    }

}

export async function POST(req: NextRequest) {
    const database = await db;
    const usersCollection = database?.collection("users");

    if (usersCollection) {
        const body = await req.json();
        const { username, email, password } = body;
        if (!username || !email || !password) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

        const existingUser = await usersCollection.findOne({ $or: [ { username }, { email } ] });
        if (existingUser) return NextResponse.json({ message: "User already exists" }, { status: 409 });

        const raw = createHash("sha256").update(password).digest("hex");
        const hashedPassword = createHash("sha256").update(raw).digest("hex");

        // Add user creation logic here (e.g., hashing password, inserting into database)
        const newUser = {
            username,
            email,
            password : hashedPassword,
            name: body.name || "",
            bio: body.bio || "",
            media: {
                avatar: "default_avatar.png",
                banner: "default_banner.png"
            },
            followers: [],
            following: [],
            tweetCount: 0,
            likeCount: 0,
            bookmarkCount: 0,
            retweetCount: 0
        };
        // Insert the new user into the database
        const result = await usersCollection.insertOne(newUser);
        if (result.insertedId) {
            const { password, ...userWithoutPassword } = newUser;
            return NextResponse.json(userWithoutPassword, { status: 201 });
        } else {
            return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
        }
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