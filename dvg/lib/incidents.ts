import { prisma } from "./prisma";
import { approxCoords } from "./geo";
import type { StructuredIncident } from "./sarvam";

export const URGENCY_RANK: Record<string, number> = { low: 1, medium: 2, high: 3 };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const union = (a: unknown, b: string[]) => Array.from(new Set([...(Array.isArray(a) ? (a as string[]) : []), ...b]));

/** Find an open incident with same issueType and similar locationText (simple string match), else create. */
export async function upsertIncident(s: StructuredIncident) {
  const loc = norm(s.locationText);
  const candidates = await prisma.incident.findMany({
    where: { issueType: s.issueType, status: { not: "resolved" } },
    orderBy: { createdAt: "desc" },
  });
  const match = candidates.find((c) => {
    const cl = norm(c.locationText);
    return cl && loc && (cl === loc || cl.includes(loc) || loc.includes(cl));
  });

  if (match) {
    return prisma.incident.update({
      where: { id: match.id },
      data: {
        totalReports: { increment: 1 },
        peopleAtRiskTotal: { increment: s.peopleCount },
        vulnerableGroups: union(match.vulnerableGroups, s.vulnerableGroups),
        resourcesNeeded: union(match.resourcesNeeded, s.resourceNeeded),
        maxUrgency: URGENCY_RANK[s.urgency] > URGENCY_RANK[match.maxUrgency] ? s.urgency : match.maxUrgency,
      },
    });
  }
  const { lat, lng } = approxCoords(s.locationText);
  return prisma.incident.create({
    data: {
      areaName: s.locationText.split(",")[0].trim() || "Unknown",
      locationText: s.locationText,
      lat, lng,
      issueType: s.issueType,
      maxUrgency: s.urgency,
      totalReports: 1,
      peopleAtRiskTotal: s.peopleCount,
      vulnerableGroups: s.vulnerableGroups,
      resourcesNeeded: s.resourceNeeded,
      status: "new",
    },
  });
}
