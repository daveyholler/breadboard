import { NextResponse } from "next/server";
import { listBreadboards, createBreadboard } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const breadboards = await listBreadboards();
  return NextResponse.json(breadboards);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const result = await createBreadboard(name);
  return NextResponse.json(result, { status: 201 });
}
