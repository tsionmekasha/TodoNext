import { NextResponse } from "next/server";
import clientPromise from "../../../server/mongodb";
import { getUserIdFromRequest } from "../../../server/jwt";

export async function PATCH(request: Request) {
  try {
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("users").findOneAndUpdate(
      { _id: typeof userId === "string" ? new (await import('mongodb')).ObjectId(userId) : userId },
      { $set: { name: name.trim() } },
      { returnDocument: "after" }
    );
    if (!result || !result.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Profile updated", user: result.value });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 