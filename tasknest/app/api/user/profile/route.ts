import { NextResponse } from "next/server";
import clientPromise from "../../../server/mongodb";
import { getUserIdFromRequest } from "../../../server/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 