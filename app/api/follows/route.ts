import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const followsCollection = database.collection("follows");
        const usersCollection = database.collection("users");
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const followerId = searchParams.get('followerId');
        const followingId = searchParams.get('followingId');
        const type = searchParams.get('type'); // 'followers' | 'following'
        
        if (userId && type) {
            if (type === 'followers') {
                // Get users who follow this user
                const followers = await followsCollection.find({ followingId: new ObjectId(userId) }).toArray();
                const followerDetails = await Promise.all(
                    followers.map(async (follow) => {
                        const user = await usersCollection.findOne({ _id: follow.followerId });
                        return user ? { ...user, followedAt: follow.createdAt } : null;
                    })
                );
                return NextResponse.json({ followers: followerDetails.filter(Boolean), count: followerDetails.length });
            } else if (type === 'following') {
                // Get users that this user follows
                const following = await followsCollection.find({ followerId: new ObjectId(userId) }).toArray();
                const followingDetails = await Promise.all(
                    following.map(async (follow) => {
                        const user = await usersCollection.findOne({ _id: follow.followingId });
                        return user ? { ...user, followedAt: follow.createdAt } : null;
                    })
                );
                return NextResponse.json({ following: followingDetails.filter(Boolean), count: followingDetails.length });
            }
        }
        
        if (followerId && followingId) {
            // Check if specific follow relationship exists
            const follow = await followsCollection.findOne({ 
                followerId: new ObjectId(followerId), 
                followingId: new ObjectId(followingId) 
            });
            return NextResponse.json({ isFollowing: !!follow, follow });
        }
        
        // Get all follows
        const allFollows = await followsCollection.find({}).toArray();
        return NextResponse.json({ follows: allFollows, count: allFollows.length });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching follows", details: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const followsCollection = database.collection("follows");
        const usersCollection = database.collection("users");
        const notificationsCollection = database.collection("notifications");

        const body = await req.json();
        const { followerUsername, followingUsername } = body;
        
        if (!followerUsername || !followingUsername) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (followerUsername === followingUsername) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        const [follower, following] = await Promise.all([
            usersCollection.findOne({ username: followerUsername }),
            usersCollection.findOne({ username: followingUsername })
        ]);

        if (!follower || !following) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already following
        const existingFollow = await followsCollection.findOne({ 
            followerId: follower._id, 
            followingId: following._id 
        });
        
        if (existingFollow) {
            // Unfollow
            await followsCollection.deleteOne({ _id: existingFollow._id });
            
            // Update follower/following counts
            await Promise.all([
                usersCollection.updateOne({ _id: follower._id }, { $inc: { "stats.following": -1 } }),
                usersCollection.updateOne({ _id: following._id }, { $inc: { "stats.followers": -1 } })
            ]);
            
            return NextResponse.json({ 
                message: "Unfollowed successfully", 
                isFollowing: false 
            }, { status: 200 });
        } else {
            // Follow
            const newFollow = {
                followerId: follower._id,
                followingId: following._id,
                createdAt: new Date()
            };
            
            await followsCollection.insertOne(newFollow);
            
            // Update follower/following counts
            await Promise.all([
                usersCollection.updateOne({ _id: follower._id }, { $inc: { "stats.following": 1 } }),
                usersCollection.updateOne({ _id: following._id }, { $inc: { "stats.followers": 1 } })
            ]);
            
            // Create notification
            await notificationsCollection.insertOne({
                receiverId: following._id,
                actor: {
                    userId: follower._id,
                    username: follower.username,
                    name: follower.name,
                    avatar: follower.media?.profileImage || "/placeholder-avatar.png"
                },
                type: "follow",
                isRead: false,
                createdAt: new Date()
            });
            
            return NextResponse.json({ 
                message: "Followed successfully", 
                isFollowing: true 
            }, { status: 201 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error processing follow", details: error }, { status: 500 });
    }
}
        
        const body = await req.json();
        const { followerId, followingId } = body;
        
        if (!followerId || !followingId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        if (followerId === followingId) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }
        
        const followerObjectId = new ObjectId(followerId);
        const followingObjectId = new ObjectId(followingId);
        
        // Check if users exist
        const [follower, following] = await Promise.all([
            usersCollection.findOne({ _id: followerObjectId }),
            usersCollection.findOne({ _id: followingObjectId })
        ]);
        
        if (!follower || !following) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        // Check if follow relationship already exists
        const existingFollow = await followsCollection.findOne({ 
            followerId: followerObjectId, 
            followingId: followingObjectId 
        });
        
        if (existingFollow) {
            // Unfollow
            await followsCollection.deleteOne({ _id: existingFollow._id });
            
            // Update user stats
            await Promise.all([
                usersCollection.updateOne({ _id: followerObjectId }, { $inc: { "stats.following": -1 } }),
                usersCollection.updateOne({ _id: followingObjectId }, { $inc: { "stats.followers": -1 } })
            ]);
            
            return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false }, { status: 200 });
        } else {
            // Follow
            const newFollow = {
                followerId: followerObjectId,
                followingId: followingObjectId,
                createdAt: new Date()
            };
            
            const result = await followsCollection.insertOne(newFollow);
            
            // Update user stats
            await Promise.all([
                usersCollection.updateOne({ _id: followerObjectId }, { $inc: { "stats.following": 1 } }),
                usersCollection.updateOne({ _id: followingObjectId }, { $inc: { "stats.followers": 1 } })
            ]);
            
            // Create notification
            const notification = {
                receiverId: followingObjectId,
                actor: {
                    userId: follower._id,
                    username: follower.username,
                    name: follower.name,
                    avatar: follower.media?.profileImage || "/placeholder-avatar.png"
                },
                type: "follow",
                tweetId: null,
                isRead: false,
                createdAt: new Date()
            };
            
            await notificationsCollection.insertOne(notification);
            
            return NextResponse.json({ 
                message: "Followed successfully", 
                isFollowing: true, 
                followId: result.insertedId 
            }, { status: 201 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error processing follow request", details: error }, { status: 500 });
    }
}