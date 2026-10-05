import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// AUTH: add authentication/authorization (control-room staff only) here.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const incident = await prisma.incident.update({ where: { id: params.id }, data: { status: "verified" } });
  return NextResponse.json(incident);
}
