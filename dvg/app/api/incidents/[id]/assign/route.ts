import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// AUTH: add authentication/authorization (control-room staff only) here.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { assignedToTeam } = await req.json().catch(() => ({}));
  if (!assignedToTeam || typeof assignedToTeam !== "string") return NextResponse.json({ error: "assignedToTeam is required" }, { status: 400 });
  const incident = await prisma.incident.update({ where: { id: params.id }, data: { assignedToTeam: assignedToTeam.trim(), status: "assigned" } });
  return NextResponse.json(incident);
}
