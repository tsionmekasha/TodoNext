import { NextResponse } from "next/server";
import { loginUser } from "./logic";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const result = await loginUser({ email, password });
  return NextResponse.json(result.body, { status: result.status });
}
