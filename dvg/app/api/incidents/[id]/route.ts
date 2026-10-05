import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
    include: {
      reports: {
        orderBy: { createdAt: "desc" },
        select: { id: true, language: true, transcriptLocal: true, transcriptEn: true, structuredData: true, createdAt: true },
      },
    },
  });
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(incident);
}
