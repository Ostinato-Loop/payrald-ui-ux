import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/wallet", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const balances = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
  const totalNgn = balances.reduce((s, b) => s + b.total, 0);
  return res.json({ balances, totalNgn });
});

router.get("/wallet/summary", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sentRow] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.direction, "debit"), gte(transactionsTable.createdAt, startOfMonth)));

  const [receivedRow] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.direction, "credit"), gte(transactionsTable.createdAt, startOfMonth)));

  const [countRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, userId), gte(transactionsTable.createdAt, startOfMonth)));

  const [topRow] = await db
    .select({ name: transactionsTable.counterpartyName, total: sql<number>`SUM(amount)` })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.direction, "debit")))
    .groupBy(transactionsTable.counterpartyName)
    .orderBy(sql`SUM(amount) DESC`)
    .limit(1);

  const transactionCount = Number(countRow?.count ?? 0);

  return res.json({
    sentThisMonth: Number(sentRow?.total ?? 0),
    receivedThisMonth: Number(receivedRow?.total ?? 0),
    feesSaved: transactionCount * 52.5,
    transactionCount,
    topRecipient: topRow?.name ?? null,
  });
});

export default router;
