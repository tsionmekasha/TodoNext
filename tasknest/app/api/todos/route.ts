import { NextResponse } from "next/server";
import clientPromise from "../../server/mongodb";
import { getUserIdFromRequest } from "../../server/jwt";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const { title } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();
    const todo = {
      userId, // store as string
      title: title.trim(),
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("todos").insertOne(todo);
    return NextResponse.json({
      _id: result.insertedId,
      ...todo,
    }, { status: 201 });
  } catch (error) {
    console.error("Create todo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const todos = await db
      .collection("todos")
      .find({ userId }) // query as string
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error("Get todos error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 