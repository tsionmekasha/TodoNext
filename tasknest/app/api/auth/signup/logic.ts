import bcrypt from "bcrypt";
import clientPromise from "../../../server/mongodb";

export async function signupUser({ name, email, password }: { name: string, email: string, password: string }) {
  if (!name || !email || !password) {
    return { status: 400, body: { error: "Missing name, email, or password" } };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return { status: 409, body: { error: "User already exists" } };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });
    return { status: 201, body: { message: "User created successfully" } };
  } catch (error) {
    console.error("Signup error:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
} 