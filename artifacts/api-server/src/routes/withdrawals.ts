import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, banksTable, walletsTable, transactionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { InitiateWithdrawalBody, ListWithdrawalsQueryParams } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();
function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/withdrawals", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const params = ListWithdrawalsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const rows = await db.select().from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, userId))
    .orderBy(desc(withdrawalsTable.createdAt)).limit(limit);
  return res.json(rows);
});

router.post("/withdrawals", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = InitiateWithdrawalBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });

  const { bankCode, accountName, amount, currency = "NGN", narration, identityType = "Personal" } = body.data;
  const bank = await db.select().from(banksTable).where(eq(banksTable.code, bankCode)).limit(1);
  if (!bank[0]) return res.status(400).json({ error: "Unsupported bank" });

  const wallets = await db.select().from(walletsTable)
    .where(and(eq(walletsTable.userId, userId), eq(walletsTable.type, identityType)));
  const fee = 50;
  if (!wallets[0] || wallets[0].available < amount + fee) {
    return res.status(422).json({ error: "Insufficient balance" });
  }

  await db.update(walletsTable)
    .set({ available: wallets[0].available - amount - fee, total: wallets[0].total - amount - fee })
    .where(eq(walletsTable.id, wallets[0].id));

  const id = randomUUID();
  const [withdrawal] = await db.insert(withdrawalsTable).values({
    id, userId, bankCode, bankName: bank[0].name, accountName,
    amount, fee, currency, narration: narration ?? null, status: "completed",
  }).returning();

  await db.insert(transactionsTable).values({
    id: randomUUID(), userId, type: "withdrawal",
    description: `Withdrawal to ${bank[0].shortName}`, counterpartyName: bank[0].name,
    counterpartyAlias: bankCode, amount, fee, currency, direction: "debit",
    status: "completed", reference: id,
  });

  return res.status(201).json(withdrawal);
});

router.get("/withdrawals/banks", async (_req, res) => {
  const banks = await db.select().from(banksTable).where(eq(banksTable.supported, true));
  return res.json(banks);
});

export default router;
