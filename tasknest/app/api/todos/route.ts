import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../server/jwt";
import { NextRequest } from "next/server";
import pool from "../../server/postgresql";

  export async function POST(request: NextRequest) {
    try {
      // Authenticate user
      const userId = getUserIdFromRequest(request as any);
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

    // Parse and validate body
    const { title, completed } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    let completedValue = false;
    if (typeof completed !== 'undefined') {
      if (typeof completed !== 'boolean') {
        return NextResponse.json({ error: "'completed' must be a boolean" }, { status: 400 });
      }
      completedValue = completed;
    }

    // PostgreSQL logic
    const now = new Date();
    const { rows } = await pool.query(
      `INSERT INTO todos (user_id, title, completed, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title.trim(), completedValue, now, now]
    );
    return NextResponse.json(rows[0], { status: 201 });
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

    // PostgreSQL logic
    const { rows } = await pool.query(
      `SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Get todos error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}