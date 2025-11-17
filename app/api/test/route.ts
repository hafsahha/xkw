import { NextResponse } from "next/server";
import db from "@/lib/db";
// yang atas ini reusable untuk tiap route api yg butuh db

// yang bawah cuma tes doang, apus klo egk btuh lg
export async function GET() {
  const database = await db;
  const user = database?.collection("users"); // collection user hanya contoh

  if (user) {
    const docs = await user.find({}).toArray();
    const serialized = docs.map((doc) => ({ ...doc, _id: doc._id?.toString() }));
    return NextResponse.json(serialized);
  }
  return NextResponse.json({ message: "No users found" });
}
