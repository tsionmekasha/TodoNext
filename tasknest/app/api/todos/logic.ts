import { ObjectId } from "mongodb";
import clientPromise from "../../server/mongodb";

export async function createTodo({ userId, title, completed }: { userId: string, title: string, completed?: boolean }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    return { status: 400, body: { error: "Title is required" } };
  }
  let completedValue = false;
  if (typeof completed !== 'undefined') {
    if (typeof completed !== 'boolean') {
      return { status: 400, body: { error: "'completed' must be a boolean" } };
    }
    completedValue = completed;
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const now = new Date();
    const todo = {
      userId,
      title: title.trim(),
      completed: completedValue,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("todos").insertOne(todo);
    return { status: 201, body: { _id: result.insertedId, ...todo } };
  } catch (error) {
    console.error("Create todo error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}

export async function getTodos({ userId }: { userId: string }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const todos = await db.collection("todos").find({ userId }).sort({ createdAt: -1 }).toArray();
    return { status: 200, body: todos };
  } catch (error) {
    console.error("Get todos error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}

export async function updateTodo({ userId, id, body }: { userId: string, id: string, body: { title?: string, completed?: boolean } }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!ObjectId.isValid(id)) {
    return { status: 400, body: { error: "Invalid todo id" } };
  }
  const updateFields: { updatedAt: Date; title?: string; completed?: boolean } = { updatedAt: new Date() };
  if (body.title !== undefined) {
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return { status: 400, body: { error: "Title is required" } };
    }
    updateFields.title = body.title.trim();
  }
  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      return { status: 400, body: { error: "'completed' must be a boolean" } };
    }
    updateFields.completed = body.completed;
  }
  if (!updateFields.title && updateFields.completed === undefined) {
    return { status: 400, body: { error: "No valid fields to update" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("todos").findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    if (!result) {
      return { status: 500, body: { error: "Unexpected update failure" } };
    }
    if (!result.value) {
      const fallback = await db.collection("todos").findOne({ _id: new ObjectId(id), userId });
      if (fallback) {
        return { status: 200, body: fallback };
      } else {
        return { status: 404, body: { error: "Todo not found" } };
      }
    }
    return { status: 200, body: result.value };
  } catch (error) {
    console.error("Update todo error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}

export async function deleteTodo({ userId, id }: { userId: string, id: string }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!ObjectId.isValid(id)) {
    return { status: 400, body: { error: "Invalid todo id" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("todos").deleteOne({ _id: new ObjectId(id), userId });
    if (result.deletedCount === 0) {
      return { status: 404, body: { error: "Todo not found" } };
    }
    return { status: 204, body: null };
  } catch (error) {
    console.error("Delete todo error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
} 