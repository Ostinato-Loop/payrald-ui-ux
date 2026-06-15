import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { paymentsTable, merchantsTable, walletsTable, transactionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const InitiatePaymentBody = z.object({
  merchantAlias: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("NGN"),
  note: z.string().optional(),
});

function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/payments", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const rows = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.payerId, userId))
    .orderBy(desc(paymentsTable.createdAt)).limit(20);
  return res.json(rows);
});

router.post("/payments", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = InitiatePaymentBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body", details: body.error.flatten() });

  const { merchantAlias, amount, currency = "NGN", note } = body.data;
  const handle = merchantAlias.startsWith("@") ? merchantAlias.slice(1) : merchantAlias.split("@")[0];

  const merchant = await db.select().from(merchantsTable).where(eq(merchantsTable.handle, handle)).limit(1);
  if (!merchant[0]) return res.status(422).json({ error: "Merchant not found" });

  const wallets = await db.select().from(walletsTable)
    .where(and(eq(walletsTable.userId, userId), eq(walletsTable.type, "Personal")));
  if (!wallets[0] || wallets[0].available < amount) {
    return res.status(422).json({ error: "Insufficient balance" });
  }

  await db.update(walletsTable)
    .set({ available: wallets[0].available - amount, total: wallets[0].total - amount })
    .where(eq(walletsTable.id, wallets[0].id));

  const id = randomUUID();
  const [payment] = await db.insert(paymentsTable).values({
    id,
    payerId: userId,
    merchantAlias,
    merchantName: merchant[0].name,
    amount,
    fee: 0,
    currency,
    note: note ?? null,
    status: "completed",
  }).returning();

  await db.insert(transactionsTable).values({
    id: randomUUID(),
    userId,
    type: "payment",
    description: `Paid ${merchant[0].name}`,
    counterpartyName: merchant[0].name,
    counterpartyAlias: merchantAlias,
    amount,
    fee: 0,
    currency,
    direction: "debit",
    status: "completed",
    reference: id,
  });

  return res.status(201).json(payment);
});

router.get("/payments/nearby", async (_req, res) => {
  const merchants = await db.select().from(merchantsTable).limit(10);
  return res.json(merchants);
});

export default router;
