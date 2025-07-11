import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "../../../server/mongodb";
import { getUserIdFromRequest } from "../../../server/jwt";

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ _id: typeof userId === "string" ? new (await import('mongodb')).ObjectId(userId) : userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 