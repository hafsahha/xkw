import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const notificationsCollection = database.collection("notifications");
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        
        let query: any = { receiverId: new ObjectId(userId) };
        
        if (type) {
            query.type = type;
        }
        
        if (unreadOnly) {
            query.isRead = false;
        }
        
        const skip = (page - 1) * limit;
        
        const notifications = await notificationsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        
        const totalCount = await notificationsCollection.countDocuments(query);
        const unreadCount = await notificationsCollection.countDocuments({ 
            receiverId: new ObjectId(userId), 
            isRead: false 
        });
        
        return NextResponse.json({ 
            notifications, 
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            },
            unreadCount
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Error fetching notifications", details: error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const notificationsCollection = database.collection("notifications");
        
        const body = await req.json();
        const { receiverId, actor, type, tweetId } = body;
        
        if (!receiverId || !actor || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        const newNotification = {
            receiverId: new ObjectId(receiverId),
            actor: {
                userId: new ObjectId(actor.userId),
                username: actor.username,
                name: actor.name,
                avatar: actor.avatar || "/placeholder-avatar.png"
            },
            type, // 'follow', 'like', 'retweet', 'reply', 'mention', 'quote'
            tweetId: tweetId ? new ObjectId(tweetId) : null,
            isRead: false,
            createdAt: new Date()
        };
        
        const result = await notificationsCollection.insertOne(newNotification);
        
        return NextResponse.json({ 
            message: "Notification created successfully", 
            notificationId: result.insertedId 
        }, { status: 201 });
        
    } catch (error) {
        return NextResponse.json({ error: "Error creating notification", details: error }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const notificationsCollection = database.collection("notifications");
        
        const body = await req.json();
        const { notificationId, userId, markAllAsRead } = body;
        
        if (markAllAsRead && userId) {
            // Mark all notifications as read for a user
            const result = await notificationsCollection.updateMany(
                { receiverId: new ObjectId(userId), isRead: false },
                { $set: { isRead: true } }
            );
            
            return NextResponse.json({ 
                message: "All notifications marked as read", 
                modifiedCount: result.modifiedCount 
            });
        } else if (notificationId) {
            // Mark specific notification as read
            const result = await notificationsCollection.updateOne(
                { _id: new ObjectId(notificationId) },
                { $set: { isRead: true } }
            );
            
            if (result.matchedCount === 0) {
                return NextResponse.json({ error: "Notification not found" }, { status: 404 });
            }
            
            return NextResponse.json({ message: "Notification marked as read" });
        } else {
            return NextResponse.json({ error: "Missing notification ID or user ID" }, { status: 400 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error updating notification", details: error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const database = await db;
        if (!database) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        
        const notificationsCollection = database.collection("notifications");
        
        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get('id');
        const userId = searchParams.get('userId');
        const deleteAll = searchParams.get('deleteAll') === 'true';
        
        if (deleteAll && userId) {
            // Delete all notifications for a user
            const result = await notificationsCollection.deleteMany({ receiverId: new ObjectId(userId) });
            return NextResponse.json({ 
                message: "All notifications deleted", 
                deletedCount: result.deletedCount 
            });
        } else if (notificationId) {
            // Delete specific notification
            const result = await notificationsCollection.deleteOne({ _id: new ObjectId(notificationId) });
            
            if (result.deletedCount === 0) {
                return NextResponse.json({ error: "Notification not found" }, { status: 404 });
            }
            
            return NextResponse.json({ message: "Notification deleted successfully" });
        } else {
            return NextResponse.json({ error: "Missing notification ID or user ID" }, { status: 400 });
        }
        
    } catch (error) {
        return NextResponse.json({ error: "Error deleting notification", details: error }, { status: 500 });
    }
}