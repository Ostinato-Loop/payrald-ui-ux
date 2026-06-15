import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactsTable = pgTable("contacts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  raldId: text("rald_id").notNull(),
  displayName: text("display_name").notNull(),
  initials: text("initials").notNull(),
  totalSent: real("total_sent").notNull().default(0),
  lastTransactionAt: timestamp("last_transaction_at").notNull().defaultNow(),
});

export const insertContactSchema = createInsertSchema(contactsTable).omit({ lastTransactionAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;
