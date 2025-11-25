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

                // Dynamically calculate stats
                serializedUser.stats = {
                    followers: serializedUser.followers.length,
                    following: serializedUser.following.length,
                    tweetCount: serializedUser.tweetCount || 0,
                };

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
        }));
        console.log("[API] Fetching all users, count:", serializedUsers.length);
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
            media: { avatar: "default_avatar.png", banner: "default_banner.png" },
            followers: [],
            following: [],
            tweetCount: 0,
            likeCount: 0,
            bookmarkCount: 0,
            retweetCount: 0,
            createdAt: new Date(),
        };
        // Insert the new user into the database
        const result = await usersCollection.insertOne(newUser);
        if (result.insertedId) {
            const { password, ...userWithoutPassword } = newUser;
            console.log("[API] New user created:", username);
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

export async function PUT(req: NextRequest) {
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