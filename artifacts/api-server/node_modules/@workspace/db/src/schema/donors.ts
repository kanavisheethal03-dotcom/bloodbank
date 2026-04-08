import { pgTable, serial, text, integer, numeric, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donorStatusEnum = pgEnum("donor_status", ["Pending", "Eligible", "Rejected", "Deferred"]);
export const consentStatusEnum = pgEnum("consent_status", ["None", "Accepted", "Rejected"]);

export const donorsTable = pgTable("donors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  blood_group: text("blood_group").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  weight: numeric("weight", { precision: 5, scale: 1 }).notNull(),
  disease: text("disease").notNull().default("None"),
  last_donation_date: date("last_donation_date"),
  city: text("city").notNull(),
  status: donorStatusEnum("status").notNull().default("Pending"),
  consent_status: consentStatusEnum("consent_status").notNull().default("None"),
  registration_date: timestamp("registration_date").notNull().defaultNow(),
});

export const insertDonorSchema = createInsertSchema(donorsTable).omit({ id: true, registration_date: true, status: true, consent_status: true });
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donorsTable.$inferSelect;
