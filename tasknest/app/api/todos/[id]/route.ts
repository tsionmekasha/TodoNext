import { NextResponse, NextRequest } from "next/server";
import clientPromise from "../../../server/mongodb";
import { getUserIdFromRequest } from "../../../server/jwt";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest, context: any) {
  try {
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
    }

    const { title } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("todos").findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: { title: title.trim(), updatedAt: new Date() } },
      { returnDocument: "after" } 
    );

    if (!result) {
      return NextResponse.json({ error: "Unexpected update failure" }, { status: 500 });
    }

    if (!result.value) {
      const fallback = await db.collection("todos").findOne({ _id: new ObjectId(id), userId });
      if (fallback) {
        return NextResponse.json(fallback, { status: 200 });
      } else {
        return NextResponse.json({ error: "Todo not found" }, { status: 404 });
      }
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    console.error("Update todo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("todos").deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Delete todo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
