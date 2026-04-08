import { Router } from "express";
import { db } from "@workspace/db";
import { donorsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ListDonorsQueryParams,
  CreateDonorBody,
  GetDonorParams,
  UpdateDonorStatusParams,
  UpdateDonorStatusBody,
  UpdateDonorConsentParams,
  UpdateDonorConsentBody,
  SearchDonorsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const params = ListDonorsQueryParams.safeParse(req.query);
    let query = db.select().from(donorsTable);

    const conditions = [];
    if (params.success && params.data.status) {
      conditions.push(eq(donorsTable.status, params.data.status as any));
    }
    if (params.success && params.data.blood_group) {
      conditions.push(eq(donorsTable.blood_group, params.data.blood_group));
    }
    if (params.success && params.data.city) {
      conditions.push(eq(donorsTable.city, params.data.city));
    }

    let donors;
    if (conditions.length > 0) {
      donors = await db.select().from(donorsTable).where(and(...conditions));
    } else {
      donors = await db.select().from(donorsTable);
    }

    const mapped = donors.map((d) => ({
      ...d,
      weight: Number(d.weight),
      registration_date: d.registration_date?.toISOString() ?? new Date().toISOString(),
      last_donation_date: d.last_donation_date ?? null,
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list donors");
    res.status(500).json({ error: "Internal server error", message: "Failed to list donors" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateDonorBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", message: parsed.error.message });
    }

    const data = parsed.data;
    const [donor] = await db.insert(donorsTable).values({
      name: data.name,
      age: data.age,
      blood_group: data.blood_group,
      phone: data.phone,
      email: data.email,
      weight: String(data.weight),
      disease: data.disease,
      last_donation_date: data.last_donation_date ?? null,
      city: data.city,
      status: "Pending",
      consent_status: "None",
    }).returning();

    res.status(201).json({
      ...donor,
      weight: Number(donor.weight),
      registration_date: donor.registration_date?.toISOString() ?? new Date().toISOString(),
      last_donation_date: donor.last_donation_date ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create donor");
    res.status(500).json({ error: "Internal server error", message: "Failed to create donor" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const parsed = SearchDonorsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", message: parsed.error.message });
    }

    const { blood_group, city } = parsed.data;
    const donors = await db.select().from(donorsTable).where(
      and(
        eq(donorsTable.blood_group, blood_group),
        eq(donorsTable.city, city),
        eq(donorsTable.status, "Eligible")
      )
    );

    const mapped = donors.map((d) => ({
      id: d.id,
      name: d.name,
      blood_group: d.blood_group,
      city: d.city,
      status: d.status,
      consent_status: d.consent_status,
      phone: d.consent_status === "Accepted" ? d.phone : null,
      email: d.consent_status === "Accepted" ? d.email : null,
    }));

    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to search donors");
    res.status(500).json({ error: "Internal server error", message: "Failed to search donors" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetDonorParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", message: parsed.error.message });
    }

    const [donor] = await db.select().from(donorsTable).where(eq(donorsTable.id, parsed.data.id));
    if (!donor) {
      return res.status(404).json({ error: "Not found", message: "Donor not found" });
    }
    res.json({
      ...donor,
      weight: Number(donor.weight),
      registration_date: donor.registration_date?.toISOString() ?? new Date().toISOString(),
      last_donation_date: donor.last_donation_date ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get donor");
    res.status(500).json({ error: "Internal server error", message: "Failed to get donor" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateDonorStatusParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "Validation error", message: paramsParsed.error.message });
    }

    const bodyParsed = UpdateDonorStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Validation error", message: bodyParsed.error.message });
    }

    const [donor] = await db.update(donorsTable)
      .set({ status: bodyParsed.data.status as any })
      .where(eq(donorsTable.id, paramsParsed.data.id))
      .returning();

    if (!donor) {
      return res.status(404).json({ error: "Not found", message: "Donor not found" });
    }

    res.json({
      ...donor,
      weight: Number(donor.weight),
      registration_date: donor.registration_date?.toISOString() ?? new Date().toISOString(),
      last_donation_date: donor.last_donation_date ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update donor status");
    res.status(500).json({ error: "Internal server error", message: "Failed to update donor status" });
  }
});

router.patch("/:id/consent", async (req, res) => {
  try {
    const paramsParsed = UpdateDonorConsentParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "Validation error", message: paramsParsed.error.message });
    }

    const bodyParsed = UpdateDonorConsentBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Validation error", message: bodyParsed.error.message });
    }

    const [donor] = await db.update(donorsTable)
      .set({ consent_status: bodyParsed.data.consent_status as any })
      .where(eq(donorsTable.id, paramsParsed.data.id))
      .returning();

    if (!donor) {
      return res.status(404).json({ error: "Not found", message: "Donor not found" });
    }

    res.json({
      ...donor,
      weight: Number(donor.weight),
      registration_date: donor.registration_date?.toISOString() ?? new Date().toISOString(),
      last_donation_date: donor.last_donation_date ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update donor consent");
    res.status(500).json({ error: "Internal server error", message: "Failed to update donor consent" });
  }
});

export default router;
