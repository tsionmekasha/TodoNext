import { ObjectId } from "mongodb";
import clientPromise from "../../server/mongodb";
import bcrypt from "bcrypt";

export async function getUserProfile({ userId }: { userId: string }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return { status: 404, body: { error: "User not found" } };
    }
    return { status: 200, body: { name: user.name, email: user.email } };
  } catch (error) {
    console.error("Get profile error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}

export async function updateUserProfile({ userId, name }: { userId: string, name: string }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return { status: 400, body: { error: "Name is required" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { name: name.trim() } },
      { returnDocument: "after" }
    );
    if (!result) {
      return { status: 500, body: { error: "Unexpected update failure" } };
    }
    if (!result.value) {
      const fallback = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      if (fallback) {
        return { status: 200, body: { message: "Profile updated", user: fallback } };
      } else {
        return { status: 404, body: { error: "User not found" } };
      }
    }
    return { status: 200, body: { message: "Profile updated", user: result.value } };
  } catch (error) {
    console.error("Update profile error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}

export async function changeUserPassword({ userId, currentPassword, newPassword }: { userId: string, currentPassword: string, newPassword: string }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!currentPassword || !newPassword) {
    return { status: 400, body: { error: "Both current and new password are required" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const objectUserId = new ObjectId(userId);
    const user = await db.collection("users").findOne({ _id: objectUserId });
    if (!user || !user.password) {
      return { status: 404, body: { error: "User not found" } };
    }
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return { status: 401, body: { error: "Current password is incorrect" } };
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: objectUserId },
      { $set: { password: hashedPassword } }
    );
    return { status: 200, body: { message: "Password changed successfully" } };
  } catch (error) {
    console.error("Change password error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
} 