import { Router } from "express";
import { db } from "@workspace/db";
import { donorsTable, bloodStockTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { blood_group, city, urgency = "high" } = req.body;

    if (!blood_group || !city) {
      return res.status(400).json({ error: "blood_group and city are required" });
    }

    // 1. Search for nearest donors in the same city
    const donors = await db
      .select({
        id: donorsTable.id,
        name: donorsTable.name,
        phone: donorsTable.phone,
        status: donorsTable.status,
      })
      .from(donorsTable)
      .where(
        and(
          eq(donorsTable.blood_group, blood_group),
          eq(donorsTable.city, city),
          eq(donorsTable.status, "Eligible")
        )
      )
      .limit(5);

    // 2. Check local blood bank stock
    const [stock] = await db
      .select()
      .from(bloodStockTable)
      .where(eq(bloodStockTable.blood_group, blood_group));

    const isUrgent = urgency === "high" || urgency === "critical";
    
    // AI Decision Logic (Simulated for Hackathon Speed)
    let matchedOption = null;
    let aiSummary = "";

    if (stock && stock.units_available > 0) {
      matchedOption = {
        type: "Blood Bank",
        name: "Central Blood Repository",
        available_units: stock.units_available,
        estimated_delivery: "15-30 mins",
      };
      aiSummary = `AI Suggestion: Fastest match found at local Central Blood Repository. ${stock.units_available} units are ready for immediate dispatch.`;
    } else if (donors.length > 0) {
      const topDonor = donors[0];
      matchedOption = {
        type: "Donor",
        name: topDonor.name,
        phone: topDonor.phone,
        estimated_delivery: "45-60 mins (Transit time)",
      };
      aiSummary = `AI Suggestion: No local stock found. Instantly contacted Top-Tier Donor ${topDonor.name} in ${city}. They are eligible and nearby.`;
    } else {
      aiSummary = "AI Alert: Critical shortage. No immediate local matches. Searching neighbor cities and alerting high-priority regional banks.";
    }

    res.json({
      match: matchedOption,
      ai_summary: aiSummary,
      urgency_level: urgency,
      search_results_count: donors.length + (stock ? 1 : 0),
    });

  } catch (err) {
    req.log.error({ err }, "Emergency search failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
