import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transfersTable = pgTable("transfers", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  recipientAlias: text("recipient_alias").notNull(),
  recipientDisplay: text("recipient_display").notNull(),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(0),
  currency: text("currency").notNull().default("NGN"),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  aliasType: text("alias_type").notNull(),
  identityType: text("identity_type").notNull().default("Personal"),
  providerRef: text("provider_ref"),
  aliaResolutionToken: text("alia_resolution_token"),
  destinationBankCode: text("destination_bank_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransferSchema = createInsertSchema(transfersTable).omit({ createdAt: true });
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Transfer = typeof transfersTable.$inferSelect;
