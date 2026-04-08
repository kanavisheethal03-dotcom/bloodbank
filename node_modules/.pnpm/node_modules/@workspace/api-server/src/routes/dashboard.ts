import { Router } from "express";
import { db } from "@workspace/db";
import { donorsTable, bloodRequestsTable, bloodStockTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const [donorCounts] = await db.select({
      total: sql<number>`count(*)::int`,
      eligible: sql<number>`count(*) filter (where status = 'Eligible')::int`,
      pending: sql<number>`count(*) filter (where status = 'Pending')::int`,
      rejected: sql<number>`count(*) filter (where status = 'Rejected')::int`,
      deferred: sql<number>`count(*) filter (where status = 'Deferred')::int`,
    }).from(donorsTable);

    const [requestCounts] = await db.select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where request_status = 'Pending')::int`,
    }).from(bloodRequestsTable);

    const [stockTotal] = await db.select({
      total: sql<number>`coalesce(sum(units_available), 0)::int`,
    }).from(bloodStockTable);

    const stock = await db.select().from(bloodStockTable).orderBy(bloodStockTable.blood_group);

    const bloodGroupDonors = await db.select({
      blood_group: donorsTable.blood_group,
      count: sql<number>`count(*)::int`,
    }).from(donorsTable).where(eq(donorsTable.status, "Eligible")).groupBy(donorsTable.blood_group);

    const bloodGroupStatsMap = new Map<string, { blood_group: string; count: number; units: number }>();
    for (const s of stock) {
      bloodGroupStatsMap.set(s.blood_group, {
        blood_group: s.blood_group,
        count: 0,
        units: s.units_available,
      });
    }
    for (const d of bloodGroupDonors) {
      if (bloodGroupStatsMap.has(d.blood_group)) {
        bloodGroupStatsMap.get(d.blood_group)!.count = d.count;
      } else {
        bloodGroupStatsMap.set(d.blood_group, {
          blood_group: d.blood_group,
          count: d.count,
          units: 0,
        });
      }
    }

    res.json({
      total_donors: donorCounts.total ?? 0,
      eligible_donors: donorCounts.eligible ?? 0,
      pending_donors: donorCounts.pending ?? 0,
      rejected_donors: donorCounts.rejected ?? 0,
      deferred_donors: donorCounts.deferred ?? 0,
      total_requests: requestCounts.total ?? 0,
      pending_requests: requestCounts.pending ?? 0,
      total_units_available: stockTotal.total ?? 0,
      blood_group_stats: Array.from(bloodGroupStatsMap.values()),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error", message: "Failed to get dashboard summary" });
  }
});

export default router;
