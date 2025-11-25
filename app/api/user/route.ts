import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { createHash } from "crypto";

export async function GET(req: NextRequest) {
    const database = await db;
    const usersCollection = database?.collection("users");

    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");
    const limit = searchParams.get("limit");
    const suggestions = searchParams.get("suggestions"); // For getting user suggestions
    const currentUser = searchParams.get("currentUser"); // Current logged-in user

    if (!usersCollection) {
        console.error("[API] No users collection available");
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

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

    // Handle user suggestions request
    if (suggestions === "true") {
        if (!currentUser) {
            console.log("[API] No current user provided for suggestions");
            return NextResponse.json({ error: "Current user parameter is required for suggestions" }, { status: 400 });
        }
        console.log("[API] User suggestions request for:", currentUser);
        
        try {
            const currentUserDoc = await usersCollection.findOne({ username: currentUser });
            if (!currentUserDoc) {
                console.log("[API] Current user not found, getting random users:", currentUser);
            }

            console.log("[API] Current user found:", currentUserDoc?.username || "none");
            const followsCollection = database?.collection("follows");
            const currentFollowing = currentUserDoc?.following || [];
            console.log("[API] Current user following:", currentFollowing);
            
            // Get users excluding current user and users already being followed
            // Sort by _id (which includes timestamp) if createdAt doesn't exist
            const query: any = { username: { $ne: currentUser } };
            
            // Only add $nin filter if there are users to exclude
            if (currentFollowing.length > 0) {
                query.username = {
                    $ne: currentUser,
                    $nin: currentFollowing
                };
            }
            
            const suggestedUsers = await usersCollection
                .find(query)
                .sort({ _id: -1 }) // Sort by newest first using ObjectId
                .limit(parseInt(limit || "3"))
                .toArray();

            console.log("[API] Found suggested users:", suggestedUsers.length);

            // Add follow status and clean up data
            const serializedSuggestions = await Promise.all(
                suggestedUsers.map(async (user) => {
                    const { password, ...cleanUser } = user;
                    
                    // Check if current user is following this user (using follows collection if exists)
                    let isFollowing = false;
                    if (followsCollection && currentUserDoc) {
                        const followDoc = await followsCollection.findOne({
                            followerId: currentUserDoc._id,
                            followingId: user._id
                        });
                        isFollowing = !!followDoc;
                    } else {
                        // Fallback to checking followers array
                        isFollowing = currentFollowing.includes(user.username);
                    }

                    return {
                        ...cleanUser,
                        bio: cleanUser.bio || "", // Include bio field
                        followers: cleanUser.followers || [],
                        following: cleanUser.following || [],
                        media: cleanUser.media || { avatar: "default_avatar.png", banner: "default_banner.png" },
                        stats: {
                            followers: (cleanUser.followers || []).length,
                            following: (cleanUser.following || []).length,
                            tweetCount: cleanUser.tweetCount || 0,
                        },
                        isFollowing
                    };
                })
            );

            console.log("[API] Fetching user suggestions for:", currentUser, "count:", serializedSuggestions.length);
            return NextResponse.json(serializedSuggestions);
            
        } catch (error) {
            console.error("[API] Error in user suggestions:", error);
            return NextResponse.json({ error: "Failed to fetch user suggestions" }, { status: 500 });
        }
    }

    // Default: get all users
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