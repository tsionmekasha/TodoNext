import bcrypt from "bcrypt";
import pool from "../../../server/postgresql";


export async function signupUser({ name, email, password }: { name: string, email: string, password: string }) {
  if (!name || !email || !password) {
    return { status: 400, body: { error: "Missing name, email, or password" } };
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return { status: 409, body: { error: "User already exists" } };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, new Date()]
    );
    return { status: 201, body: { message: "User created successfully" } };
  } catch (error) {
    console.error("Signup error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
} 