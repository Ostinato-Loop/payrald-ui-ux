import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { ListTransactionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();
function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/transactions", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const params = ListTransactionsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 30) : 30;
  const type = params.success ? params.data.type : undefined;

  const userCondition = eq(transactionsTable.userId, userId);

  let typeCondition;
  if (type === "transfer") {
    typeCondition = or(
      eq(transactionsTable.type, "transfer_sent"),
      eq(transactionsTable.type, "transfer_received"),
    );
  } else if (type) {
    typeCondition = eq(transactionsTable.type, type);
  }

  const whereClause = typeCondition
    ? and(userCondition, typeCondition)
    : userCondition;

  const rows = await db
    .select()
    .from(transactionsTable)
    .where(whereClause)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return res.json({
    data,
    nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    total: data.length,
  });
});

router.get("/transactions/stats", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const all = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId));

  const debits = all.filter((t) => t.direction === "debit");
  const credits = all.filter((t) => t.direction === "credit");
  const totalSent = debits.reduce((s, t) => s + t.amount, 0);
  const totalReceived = credits.reduce((s, t) => s + t.amount, 0);
  const totalFees = all.reduce((s, t) => s + t.fee, 0);
  const feesSaved = all.length * 52.5;
  const transferCount = all.filter((t) => t.type.startsWith("transfer")).length;
  const paymentCount = all.filter((t) => t.type === "payment").length;
  const withdrawalCount = all.filter((t) => t.type === "withdrawal").length;

  const byMonth: Record<string, { sent: number; received: number }> = {};
  for (const t of all) {
    const m = t.createdAt.toISOString().slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { sent: 0, received: 0 };
    if (t.direction === "debit") byMonth[m].sent += t.amount;
    else byMonth[m].received += t.amount;
  }
  const monthlyVolume = Object.entries(byMonth).map(([month, v]) => ({
    month,
    ...v,
  }));

  return res.json({
    totalSent,
    totalReceived,
    totalFees,
    feesSaved,
    transferCount,
    paymentCount,
    withdrawalCount,
    monthlyVolume,
  });
});

export default router;
