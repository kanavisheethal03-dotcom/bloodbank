import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requestStatusEnum = pgEnum("request_status", ["Pending", "Accepted", "Rejected", "Fulfilled"]);

export const bloodRequestsTable = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  patient_name: text("patient_name").notNull(),
  blood_group: text("blood_group").notNull(),
  units_required: integer("units_required").notNull(),
  hospital_name: text("hospital_name").notNull(),
  contact_number: text("contact_number").notNull(),
  city: text("city").notNull(),
  request_status: requestStatusEnum("request_status").notNull().default("Pending"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertBloodRequestSchema = createInsertSchema(bloodRequestsTable).omit({ id: true, created_at: true, request_status: true });
export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;
export type BloodRequest = typeof bloodRequestsTable.$inferSelect;
