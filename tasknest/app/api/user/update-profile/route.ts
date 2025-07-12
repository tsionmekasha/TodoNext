import { NextResponse } from "next/server";
import clientPromise from "../../../server/mongodb";
import { getUserIdFromRequest } from "../../../server/jwt";
import { ObjectId } from "mongodb";

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
      { _id: new ObjectId(userId) },
      { $set: { name: name.trim() } },
      { returnDocument: "after" }
    );

    // Just like in your todo PUT — fallback check
    if (!result) {
      return NextResponse.json({ error: "Unexpected update failure" }, { status: 500 });
    }

    if (!result.value) {
      const fallback = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      if (fallback) {
        return NextResponse.json({ message: "Profile updated", user: fallback }, { status: 200 });
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ message: "Profile updated", user: result.value }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}