import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, banksTable, walletsTable, transactionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { initiateTransfer as squadTransfer, verifyAccountName } from "@workspace/squad";

const router: IRouter = Router();

const InitiateWithdrawalBody = z.object({
  bankCode: z.string(),
  accountName: z.string(),
  accountNumber: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default("NGN"),
  narration: z.string().optional(),
  identityType: z.string().default("Personal"),
});

function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/withdrawals", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const rows = await db.select().from(withdrawalsTable)
    .where(eq(withdrawalsTable.userId, userId))
    .orderBy(desc(withdrawalsTable.createdAt)).limit(20);
  return res.json(rows);
});

router.post("/withdrawals/verify-account", async (req, res) => {
  const { accountNumber, bankCode } = req.body as { accountNumber: string; bankCode: string };
  if (!accountNumber || !bankCode) return res.status(400).json({ error: "accountNumber and bankCode required" });
  try {
    const result = await verifyAccountName({ accountNumber, bankCode });
    return res.json({ accountName: result.account_name });
  } catch (err: any) {
    return res.status(422).json({ error: err.message ?? "Account lookup failed" });
  }
});

router.get("/withdrawals/banks", async (_req, res) => {
  const banks = await db.select().from(banksTable).where(eq(banksTable.supported, true));
  return res.json(banks);
});

router.post("/withdrawals", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = InitiateWithdrawalBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body", details: body.error.flatten() });

  const { bankCode, accountName, accountNumber, amount, currency = "NGN", narration, identityType = "Personal" } = body.data;

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

  const transactionRef = `pay_wdrl_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  let providerRef: string | null = null;

  try {
    const payout = await squadTransfer({
      accountNumber: accountNumber ?? "",
      accountName,
      bankCode,
      amountNgn: amount,
      remark: narration ?? "PayRald withdrawal",
      transactionRef,
    });
    providerRef = payout.transaction_reference;
  } catch (err: any) {
    await db.update(walletsTable)
      .set({ available: wallets[0].available, total: wallets[0].total })
      .where(eq(walletsTable.id, wallets[0].id));
    return res.status(502).json({ error: err.message ?? "Withdrawal provider error. Please try again." });
  }

  const id = randomUUID();
  const [withdrawal] = await db.insert(withdrawalsTable).values({
    id,
    userId,
    bankCode,
    bankName: bank[0].name,
    accountNumber: accountNumber ?? null,
    accountName,
    amount,
    fee,
    currency,
    narration: narration ?? null,
    status: "processing",
    providerRef,
  }).returning();

  await db.insert(transactionsTable).values({
    id: randomUUID(),
    userId,
    type: "withdrawal",
    description: `Withdrawal to ${bank[0].shortName}`,
    counterpartyName: bank[0].name,
    counterpartyAlias: bankCode,
    amount,
    fee,
    currency,
    direction: "debit",
    status: "processing",
    reference: id,
  });

  return res.status(201).json(withdrawal);
});

export default router;
