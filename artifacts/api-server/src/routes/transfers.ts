import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transfersTable, walletsTable, usersTable, transactionsTable, contactsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { resolveAlias, lookupIdentity, AliaResolutionError } from "@workspace/alia";
import { initiateTransfer as squadTransfer } from "@workspace/squad";

const router: IRouter = Router();

const InitiateTransferBody = z.object({
  recipient: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("NGN"),
  note: z.string().optional(),
  identityType: z.string().default("Personal"),
});

const ListTransfersQuery = z.object({ limit: z.coerce.number().optional() });

function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/transfers", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { limit = 20 } = ListTransfersQuery.parse(req.query);
  const rows = await db.select().from(transfersTable)
    .where(eq(transfersTable.senderId, userId))
    .orderBy(desc(transfersTable.createdAt))
    .limit(limit + 1);
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return res.json({ data, nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null, total: data.length });
});

router.post("/transfers", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = InitiateTransferBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body", details: body.error.flatten() });

  const { recipient, amount, currency = "NGN", note, identityType = "Personal" } = body.data;

  const wallets = await db.select().from(walletsTable)
    .where(and(eq(walletsTable.userId, userId), eq(walletsTable.type, identityType)));
  if (!wallets[0] || wallets[0].available < amount) {
    return res.status(422).json({ error: "Insufficient balance" });
  }

  const transactionRef = `pay_txfr_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  let resolvedToken: string | null = null;
  let destinationBankCode: string | null = null;
  let recipientDisplay = recipient;

  try {
    const resolution = await resolveAlias({
      alias: recipient,
      initiatingBank: process.env.PAYRALD_BANK_CODE ?? "035",
      transactionRef,
      ipAddress: req.ip,
    });
    resolvedToken = resolution.token;
    destinationBankCode = resolution.routing.destinationBankCode;
    recipientDisplay = resolution.routing.accountName;
  } catch (err) {
    if (err instanceof AliaResolutionError) {
      const handle = recipient.replace(/^@/, "").split("@")[0];
      const localUser = await db.select().from(usersTable).where(eq(usersTable.raldId, handle)).limit(1);
      if (localUser[0]) {
        recipientDisplay = localUser[0].name;
      } else {
        return res.status(422).json({ error: "Identity not found. Cannot resolve recipient." });
      }
    }
  }

  await db.update(walletsTable)
    .set({ available: wallets[0].available - amount, total: wallets[0].total - amount })
    .where(eq(walletsTable.id, wallets[0].id));

  let providerRef: string | null = null;
  let status = "completed";

  if (resolvedToken && destinationBankCode) {
    try {
      const payout = await squadTransfer({
        accountNumber: resolvedToken,
        accountName: recipientDisplay,
        bankCode: destinationBankCode,
        amountNgn: amount,
        remark: note ?? `PayRald transfer`,
        transactionRef,
      });
      providerRef = payout.transaction_reference;
      status = "processing";
    } catch {
      await db.update(walletsTable)
        .set({ available: wallets[0].available, total: wallets[0].total })
        .where(eq(walletsTable.id, wallets[0].id));
      return res.status(502).json({ error: "Payment provider error. Please try again." });
    }
  }

  const aliasType: "username" | "email" | "phone" =
    recipient.startsWith("+") ? "phone"
    : recipient.includes("@") && !recipient.startsWith("@") ? "email"
    : "username";

  const id = randomUUID();
  const [transfer] = await db.insert(transfersTable).values({
    id,
    senderId: userId,
    recipientAlias: recipient,
    recipientDisplay,
    amount,
    fee: 0,
    currency,
    note: note ?? null,
    status,
    aliasType,
    identityType,
    providerRef,
    aliaResolutionToken: resolvedToken,
    destinationBankCode,
  }).returning();

  await db.insert(transactionsTable).values({
    id: randomUUID(),
    userId,
    type: "transfer_sent",
    description: `Sent to ${recipientDisplay}`,
    counterpartyName: recipientDisplay,
    counterpartyAlias: recipient,
    amount,
    fee: 0,
    currency,
    direction: "debit",
    status,
    reference: id,
  });

  await upsertContact(userId, recipient, recipientDisplay, amount);

  return res.status(201).json(transfer);
});

router.get("/transfers/:id", async (req, res) => {
  const row = await db.select().from(transfersTable).where(eq(transfersTable.id, req.params.id)).limit(1);
  if (!row[0]) return res.status(404).json({ error: "Not found" });
  return res.json(row[0]);
});

async function upsertContact(userId: string, alias: string, displayName: string, amount: number) {
  try {
    const raldId = alias.replace(/^@/, "").split("@")[0];
    const existing = await db.select().from(contactsTable)
      .where(and(eq(contactsTable.userId, userId), eq(contactsTable.raldId, raldId))).limit(1);
    const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    if (existing[0]) {
      await db.update(contactsTable).set({
        totalSent: existing[0].totalSent + amount,
        lastTransactionAt: new Date(),
        displayName,
        initials,
      }).where(eq(contactsTable.id, existing[0].id));
    } else {
      await db.insert(contactsTable).values({ id: randomUUID(), userId, raldId, displayName, initials, totalSent: amount });
    }
  } catch { /* non-critical */ }
}

export default router;
