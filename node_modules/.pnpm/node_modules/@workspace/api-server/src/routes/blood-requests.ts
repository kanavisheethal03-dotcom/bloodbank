import { Router } from "express";
import { db } from "@workspace/db";
import { bloodRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateBloodRequestBody,
  UpdateBloodRequestStatusParams,
  UpdateBloodRequestStatusBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const requests = await db.select().from(bloodRequestsTable).orderBy(bloodRequestsTable.created_at);
    const mapped = requests.map((r) => ({
      ...r,
      created_at: r.created_at?.toISOString() ?? new Date().toISOString(),
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list blood requests");
    res.status(500).json({ error: "Internal server error", message: "Failed to list blood requests" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateBloodRequestBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", message: parsed.error.message });
    }

    const data = parsed.data;
    const [request] = await db.insert(bloodRequestsTable).values({
      patient_name: data.patient_name,
      blood_group: data.blood_group,
      units_required: data.units_required,
      hospital_name: data.hospital_name,
      contact_number: data.contact_number,
      city: data.city,
      request_status: "Pending",
    }).returning();

    res.status(201).json({
      ...request,
      created_at: request.created_at?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create blood request");
    res.status(500).json({ error: "Internal server error", message: "Failed to create blood request" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const paramsParsed = UpdateBloodRequestStatusParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "Validation error", message: paramsParsed.error.message });
    }

    const bodyParsed = UpdateBloodRequestStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "Validation error", message: bodyParsed.error.message });
    }

    const [request] = await db.update(bloodRequestsTable)
      .set({ request_status: bodyParsed.data.request_status as any })
      .where(eq(bloodRequestsTable.id, paramsParsed.data.id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: "Not found", message: "Blood request not found" });
    }

    res.json({
      ...request,
      created_at: request.created_at?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update blood request status");
    res.status(500).json({ error: "Internal server error", message: "Failed to update blood request status" });
  }
});

export default router;
