import { Router } from "express";
import { db } from "@workspace/db";
import { bloodStockTable, bloodBagsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const stock = await db.select().from(bloodStockTable).orderBy(bloodStockTable.blood_group);
    const mapped = stock.map((s) => ({
      ...s,
      updated_at: s.updated_at?.toISOString() ?? new Date().toISOString(),
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list blood stock");
    res.status(500).json({ error: "Internal server error", message: "Failed to list blood stock" });
  }
});

router.get("/:blood_group", async (req, res) => {
  try {
    const bloodGroup = req.params.blood_group;
    const [stock] = await db.select().from(bloodStockTable).where(eq(bloodStockTable.blood_group, bloodGroup));
    if (!stock) {
      res.status(404).json({ error: "Not found", message: "Blood group not found" });
      return;
    }
    res.json({
      ...stock,
      updated_at: stock.updated_at?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get blood stock");
    res.status(500).json({ error: "Internal server error", message: "Failed to get blood stock" });
  }
});

router.get("/inventory/all", async (req, res) => {
  try {
    const bags = await db.select().from(bloodBagsTable);
    
    const categorized = bags.map(bag => {
      const donationDate = new Date(bag.donation_date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - donationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: "Urgent" | "Use Soon" | "Safe" = "Safe";
      if (diffDays >= 30) status = "Urgent";
      else if (diffDays >= 20) status = "Use Soon";
      
      return {
        ...bag,
        expiry_status: status,
        days_old: diffDays
      };
    }).sort((a, b) => b.days_old - a.days_old);

    res.json(categorized);
  } catch (err) {
    req.log.error({ err }, "Failed to get inventory");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
