import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import clientPromise from "../../../server/mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function loginUser({ email, password }: { email: string, password: string }) {
  if (!email || !password) {
    return { status: 400, body: { error: "Missing email or password" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return { status: 401, body: { error: "Invalid credentials" } };
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return { status: 401, body: { error: "Invalid credentials" } };
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { status: 200, body: { token } };
  } catch (error) {
    console.error("Login error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
} 