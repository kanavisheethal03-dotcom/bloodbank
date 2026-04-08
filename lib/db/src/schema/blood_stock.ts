import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bloodStockTable = pgTable("blood_stock", {
  id: serial("id").primaryKey(),
  blood_group: text("blood_group").notNull().unique(),
  units_available: integer("units_available").notNull().default(0),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBloodStockSchema = createInsertSchema(bloodStockTable).omit({ id: true, updated_at: true });
export type InsertBloodStock = z.infer<typeof insertBloodStockSchema>;
export type BloodStock = typeof bloodStockTable.$inferSelect;
