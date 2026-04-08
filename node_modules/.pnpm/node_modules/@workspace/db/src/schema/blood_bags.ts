import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bloodBagsTable = pgTable("blood_bags", {
  id: serial("id").primaryKey(),
  blood_group: text("blood_group").notNull(),
  donor_id: serial("donor_id"), // Ideally a foreign key, but keeping simple
  donation_date: timestamp("donation_date").notNull().defaultNow(),
});

export const insertBloodBagSchema = createInsertSchema(bloodBagsTable).omit({ id: true });
export type InsertBloodBag = z.infer<typeof insertBloodBagSchema>;
export type BloodBag = typeof bloodBagsTable.$inferSelect;
