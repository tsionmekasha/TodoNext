import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../../server/postgresql";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function loginUser({ email, password }: { email: string, password: string }) {
  if (!email || !password) {
    return { status: 400, body: { error: "Missing email or password" } };
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return { status: 401, body: { error: "Invalid credentials" } };
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return { status: 401, body: { error: "Invalid credentials" } };
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { status: 200, body: { token } };
  } catch (error) {
    console.error("Login error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
} 