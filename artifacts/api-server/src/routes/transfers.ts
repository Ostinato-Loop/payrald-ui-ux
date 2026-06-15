import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transfersTable, walletsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, desc, and, lt } from "drizzle-orm";
import { InitiateTransferBody, ListTransfersQueryParams } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();
function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/transfers", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const params = ListTransfersQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const cursor = params.success ? params.data.cursor : undefined;

  let query = db.select().from(transfersTable)
    .where(eq(transfersTable.senderId, userId))
    .orderBy(desc(transfersTable.createdAt))
    .limit(limit + 1);

  const rows = await query;
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return res.json({
    data,
    nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    total: data.length,
  });
});

router.post("/transfers", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = InitiateTransferBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });

  const { recipient, amount, currency = "NGN", note, identityType = "Personal" } = body.data;

  const wallets = await db.select().from(walletsTable)
    .where(and(eq(walletsTable.userId, userId), eq(walletsTable.type, identityType)));
  if (!wallets[0] || wallets[0].available < amount) {
    return res.status(422).json({ error: "Insufficient balance" });
  }

  let aliasType: "username" | "email" | "phone" = "username";
  if (recipient.startsWith("+")) aliasType = "phone";
  else if (recipient.includes("@") && !recipient.startsWith("@")) aliasType = "email";

  const recipientUser = await db.select().from(usersTable)
    .where(aliasType === "email" ? eq(usersTable.email, recipient) :
           aliasType === "phone" ? eq(usersTable.phone, recipient) :
           eq(usersTable.raldId, recipient.replace("@", ""))).limit(1);
  const recipientDisplay = recipientUser[0]?.name ?? recipient;

  await db.update(walletsTable)
    .set({ available: wallets[0].available - amount, total: wallets[0].total - amount })
    .where(eq(walletsTable.id, wallets[0].id));

  const id = randomUUID();
  const [transfer] = await db.insert(transfersTable).values({
    id, senderId: userId, recipientAlias: recipient,
    recipientDisplay, amount, fee: 0, currency, note: note ?? null,
    status: "completed", aliasType, identityType,
  }).returning();

  await db.insert(transactionsTable).values({
    id: randomUUID(), userId, type: "transfer_sent",
    description: `Sent to ${recipientDisplay}`, counterpartyName: recipientDisplay,
    counterpartyAlias: recipient, amount, fee: 0, currency, direction: "debit",
    status: "completed", reference: id,
  });

  return res.status(201).json(transfer);
});

router.get("/transfers/:id", async (req, res) => {
  const row = await db.select().from(transfersTable).where(eq(transfersTable.id, req.params.id)).limit(1);
  if (!row[0]) return res.status(404).json({ error: "Not found" });
  return res.json(row[0]);
});

export default router;
