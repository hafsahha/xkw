import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import db from "@/lib/db";

// Get notifications for a user
export async function GET(req: NextRequest) {
    const database = await db;
    const notificationCollection = database?.collection("notifications");
    const userCollection = database?.collection("users");

    if (notificationCollection && userCollection) {
        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get("username");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!username) {
            return NextResponse.json({ message: "Username is required" }, { status: 400 });
        }

        // Find user
        const user = await userCollection.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Get notifications for this user, sorted by creation date (newest first)
        const notifications = await notificationCollection
            .find({ recipientId: user._id })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        // Format notifications for frontend
        const formattedNotifications = notifications.map(notification => ({
            _id: notification._id.toString(),
            type: notification.type,
            actor: notification.actor,
            tweet: notification.tweet,
            message: notification.message,
            createdAt: notification.createdAt,
            read: notification.read || false
        }));

        return NextResponse.json(formattedNotifications);
    }

    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

// Mark notification as read
export async function PATCH(req: NextRequest) {
    const database = await db;
    const notificationCollection = database?.collection("notifications");

    if (notificationCollection) {
        const body = await req.json();
        const { notificationId } = body;

        if (!notificationId) {
            return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
        }

        try {
            const result = await notificationCollection.updateOne(
                { _id: new ObjectId(notificationId) },
                { $set: { read: true } }
            );

            if (result.matchedCount === 0) {
                return NextResponse.json({ message: "Notification not found" }, { status: 404 });
            }

            return NextResponse.json({ message: "Notification marked as read" });
        } catch (error) {
            return NextResponse.json({ message: "Invalid notification ID" }, { status: 400 });
        }
    }

    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

// Mark all notifications as read for a user
export async function PUT(req: NextRequest) {
    const database = await db;
    const notificationCollection = database?.collection("notifications");
    const userCollection = database?.collection("users");

    if (notificationCollection && userCollection) {
        const body = await req.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ message: "Username is required" }, { status: 400 });
        }

        // Find user
        const user = await userCollection.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Mark all notifications as read
        const result = await notificationCollection.updateMany(
            { recipientId: user._id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ 
            message: "All notifications marked as read", 
            modifiedCount: result.modifiedCount 
        });
    }

    return NextResponse.json({ message: "Database connection error" }, { status: 500 });
}

// Helper function to create a notification (used by other API routes)
export async function createNotification({
    type,
    recipientUsername,
    actorUsername,
    tweetId,
    message
}: {
    type: "like" | "retweet" | "follow" | "reply" | "quote" | "mention";
    recipientUsername: string;
    actorUsername: string;
    tweetId?: string;
    message?: string;
}) {
    const database = await db;
    const notificationCollection = database?.collection("notifications");
    const userCollection = database?.collection("users");
    const tweetCollection = database?.collection("tweets");

    if (notificationCollection && userCollection && tweetCollection) {
        // Don't create notification for self-actions
        if (recipientUsername === actorUsername) {
            return null;
        }

        // Find recipient user
        const recipient = await userCollection.findOne({ username: recipientUsername });
        if (!recipient) return null;

        // Find actor user
        const actor = await userCollection.findOne({ username: actorUsername });
        if (!actor) return null;

        // Build notification object
        const notification: any = {
            type,
            recipientId: recipient._id,
            actorId: actor._id,
            actor: {
                name: actor.name,
                username: actor.username,
                avatar: actor.media?.avatar || "default_avatar.png"
            },
            createdAt: new Date(),
            read: false
        };

        // Add tweet data for tweet-related notifications
        if (tweetId) {
            const tweet = await tweetCollection.findOne({ tweetId });
            if (tweet) {
                notification.tweetId = tweetId;
                notification.tweet = {
                    tweetId: tweet.tweetId,
                    content: tweet.content,
                    media: tweet.media || [],
                    author: {
                        name: tweet.author.name,
                        username: tweet.author.username
                    }
                };
            }
        }

        // Add custom message for reply/quote notifications
        if (message) {
            notification.message = message;
        }

        // Check for duplicate notification in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingNotification = await notificationCollection.findOne({
            type,
            recipientId: recipient._id,
            actorId: actor._id,
            tweetId: tweetId || null,
            createdAt: { $gte: oneDayAgo }
        });

        if (existingNotification) {
            // Update timestamp instead of creating duplicate
            await notificationCollection.updateOne(
                { _id: existingNotification._id },
                { $set: { createdAt: new Date(), read: false } }
            );
            return existingNotification._id;
        }

        // Create new notification
        const result = await notificationCollection.insertOne(notification);
        return result.insertedId;
    }

    return null;
}