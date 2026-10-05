import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const rows = [
    { areaName: "Kuttanad", locationText: "Kuttanad, Alappuzha", lat: 9.4, lng: 76.4, issueType: "rescue", maxUrgency: "high", totalReports: 3, peopleAtRiskTotal: 14, vulnerableGroups: ["elderly", "children"], resourcesNeeded: ["boat"] },
    { areaName: "Koramangala", locationText: "Koramangala, Bengaluru", lat: 12.935, lng: 77.624, issueType: "food", maxUrgency: "medium", totalReports: 2, peopleAtRiskTotal: 40, vulnerableGroups: ["children"], resourcesNeeded: ["food packets"] },
    { areaName: "Cuttack", locationText: "Cuttack old town", lat: 20.46, lng: 85.88, issueType: "medical", maxUrgency: "low", totalReports: 1, peopleAtRiskTotal: 2, vulnerableGroups: [], resourcesNeeded: ["ambulance"] },
  ];
  for (const r of rows) await prisma.incident.create({ data: { ...r, status: "new" } });
  console.log("Seeded", rows.length, "incidents");
}
main().finally(() => prisma.$disconnect());
