import { NextResponse } from "next/server";
import { signupUser } from "./logic";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  const result = await signupUser({ name, email, password });
  return NextResponse.json(result.body, { status: result.status });
}
