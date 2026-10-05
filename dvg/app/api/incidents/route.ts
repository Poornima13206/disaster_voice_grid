import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { URGENCY_RANK } from "@/lib/incidents";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Record<string, string> = {};
  if (sp.get("status")) where.status = sp.get("status")!;
  if (sp.get("issueType")) where.issueType = sp.get("issueType")!;
  if (sp.get("urgency")) where.maxUrgency = sp.get("urgency")!;

  const list = await prisma.incident.findMany({ where });
  list.sort((a, b) => URGENCY_RANK[b.maxUrgency] - URGENCY_RANK[a.maxUrgency] || b.createdAt.getTime() - a.createdAt.getTime());
  return NextResponse.json(
    list.map(({ id, areaName, locationText, lat, lng, issueType, maxUrgency, totalReports, peopleAtRiskTotal, status, assignedToTeam, createdAt }) => ({
      id, areaName, locationText, lat, lng, issueType, maxUrgency, totalReports, peopleAtRiskTotal, status, assignedToTeam, createdAt,
    }))
  );
}
