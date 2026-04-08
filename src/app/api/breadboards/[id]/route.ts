import { NextResponse } from "next/server";
import { getBreadboard, updateBreadboard, deleteBreadboard } from "@/lib/db";
import { broadcast } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const breadboard = await getBreadboard(id);
  if (!breadboard) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(breadboard);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteBreadboard(id);
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  await updateBreadboard(id, {
    places: body.places,
    name: body.name,
  });
  const writerClientId = request.headers.get("x-client-id") || "";
  broadcast(id, writerClientId);
  const updated = await getBreadboard(id);
  return NextResponse.json(updated);
}
