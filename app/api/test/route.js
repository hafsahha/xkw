import { getCollection } from "../../../lib/db";

export async function GET() {
  try {
    const collection = await getCollection("testCollection");
    if (collection) {
      return Response.json({ 
        message: "MongoDB connection successful!",
        status: "connected",
        database: "dbX" 
      });
    } else {
      return Response.json({ 
        message: "Failed to connect to MongoDB",
        status: "failed" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return Response.json({ 
      message: "Internal Server Error",
      error: error.message 
    }, { status: 500 });
  }
}