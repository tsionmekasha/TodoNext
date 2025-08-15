import { NextResponse, NextRequest } from "next/server";
import pool from "../../../server/postgresql";
import { getUserIdFromRequest } from "../../../server/jwt";

export async function PUT(request: NextRequest, context: any) {
  try {
    const userId = getUserIdFromRequest(request as any);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
    }

    const body = await request.json();
  const updateFields: any = {};
      if (body.title !== undefined) {
      if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      updateFields.title = body.title.trim();
    }
    if (body.completed !== undefined) {
      if (typeof body.completed !== "boolean") {
        return NextResponse.json({ error: "'completed' must be a boolean" }, { status: 400 });
      }
      updateFields.completed = body.completed;
    }
    if (!updateFields.title && updateFields.completed === undefined) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

      // Build dynamic update query
      const now = new Date();
      let query = 'UPDATE todos SET updated_at = $1';
      const params: any[] = [now];
      let paramIdx = 2;
      if (updateFields.title !== undefined) {
        query += `, title = $${paramIdx++}`;
        params.push(updateFields.title);
      }
      if (updateFields.completed !== undefined) {
        query += `, completed = $${paramIdx++}`;
        params.push(updateFields.completed);
      }
      query += ` WHERE id = $${paramIdx++} AND user_id = $${paramIdx}`;
      params.push(id, userId);
      await pool.query(query, params);
      const result = await pool.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Todo not found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0], { status: 200 });

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
    if (!id) {
      return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
    }

    const result = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Delete todo error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
