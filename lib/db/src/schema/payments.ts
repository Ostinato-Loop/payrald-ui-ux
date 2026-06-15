import { pgTable, text, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const merchantsTable = pgTable("merchants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  category: text("category").notNull(),
  isOpen: boolean("is_open").notNull().default(true),
  verified: boolean("verified").notNull().default(true),
  rating: real("rating"),
  distanceMeters: real("distance_meters"),
});

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  payerId: text("payer_id").notNull(),
  merchantAlias: text("merchant_alias").notNull(),
  merchantName: text("merchant_name").notNull(),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(0),
  currency: text("currency").notNull().default("NGN"),
  note: text("note"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;

export const insertMerchantSchema = createInsertSchema(merchantsTable);
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type Merchant = typeof merchantsTable.$inferSelect;
