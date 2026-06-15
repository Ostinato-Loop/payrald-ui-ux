import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  counterpartyName: text("counterparty_name").notNull(),
  counterpartyAlias: text("counterparty_alias").notNull(),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(0),
  currency: text("currency").notNull().default("NGN"),
  direction: text("direction").notNull(),
  status: text("status").notNull().default("completed"),
  reference: text("reference").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
