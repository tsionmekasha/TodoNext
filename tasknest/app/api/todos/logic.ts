import pool from "../../server/postgresql";

async function createTodo(userId: string, body: { title?: string; completed?: boolean }) {
  const title = body?.title;
  if (!title || typeof title !== "string" || !title.trim()) {
    return { status: 400, body: { error: "Title is required" } };
  }
  let completedValue = false;
  const completed = body?.completed;
  if (typeof completed !== 'undefined') {
    if (typeof completed !== 'boolean') {
      return { status: 400, body: { error: "'completed' must be a boolean" } };
    }
    completedValue = completed;
  }
  try {
    const now = new Date();
    const result = await pool.query(
      `INSERT INTO todos (user_id, title, completed, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title.trim(), completedValue, now, now]
    );
    return { status: 201, body: result.rows[0] };
  } catch (error) {
    console.error("Create todo error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}

async function getTodos(userId: string) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  try {
    const result = await pool.query(
      `SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return { status: 200, body: result.rows };
  } catch (error) {
    console.error("Get todos error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}
async function updateTodo(userId: string, id: string, body: { title?: string; completed?: boolean }) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!id) {
    return { status: 400, body: { error: "Invalid todo id" } };
  }
  const updateFields: { title?: string; completed?: boolean } = {};
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
      return { status: 404, body: { error: "Todo not found" } };
    }
    return { status: 200, body: result.rows[0] };
  } catch (error) {
    console.error("Update todo error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}
async function deleteTodo(userId: string, id: string) {
  if (!userId) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!id) {
    return { status: 400, body: { error: "Invalid todo id" } };
  }
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
      return { status: 404, body: { error: "Todo not found" } };
    }
    return { status: 204, body: null };
  } catch (error) {
    console.error("Delete todo error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}  