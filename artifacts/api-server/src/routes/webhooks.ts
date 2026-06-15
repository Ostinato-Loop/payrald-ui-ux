import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable, transfersTable, withdrawalsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { verifyWebhookSignature } from "@workspace/squad";

const router: IRouter = Router();

router.post("/webhooks/squad", async (req, res) => {
  const signature = req.headers["x-squad-encrypted-body"] as string;
  const rawBody = JSON.stringify(req.body);

  if (signature && !verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  const event = req.body as {
    Event: string;
    TransactionRef?: string;
    Body?: {
      transaction_ref?: string;
      amount?: number;
      transaction_status?: string;
      customer_identifier?: string;
      virtual_account_number?: string;
    };
  };

  const eventType = event.Event;

  if (eventType === "charge_successful" || eventType === "virtual_account_transfer_successful") {
    const body = event.Body ?? {};
    const customerIdentifier = body.customer_identifier;
    const amountKobo = body.amount ?? 0;
    const amountNgn = amountKobo / 100;
    const ref = body.transaction_ref ?? randomUUID();

    if (customerIdentifier) {
      const userId = customerIdentifier.replace("payrald_", "");
      const wallets = await db.select().from(walletsTable)
        .where(and(eq(walletsTable.userId, userId), eq(walletsTable.type, "Personal")));

      if (wallets[0]) {
        await db.update(walletsTable).set({
          total: wallets[0].total + amountNgn,
          available: wallets[0].available + amountNgn,
        }).where(eq(walletsTable.id, wallets[0].id));

        await db.insert(transactionsTable).values({
          id: randomUUID(),
          userId,
          type: "transfer_received",
          description: "Wallet top-up via Wema Bank",
          counterpartyName: "Wema Bank",
          counterpartyAlias: body.virtual_account_number ?? "virtual_account",
          amount: amountNgn,
          fee: 0,
          currency: "NGN",
          direction: "credit",
          status: "completed",
          reference: ref,
        });
      }
    }
  }

  if (eventType === "transfer_success" || eventType === "payout_completed") {
    const transactionRef = event.Body?.transaction_ref ?? event.TransactionRef;
    if (transactionRef) {
      await db.update(transfersTable)
        .set({ status: "completed" })
        .where(eq(transfersTable.providerRef, transactionRef));

      await db.update(withdrawalsTable)
        .set({ status: "completed" })
        .where(eq(withdrawalsTable.providerRef, transactionRef));

      await db.update(transactionsTable)
        .set({ status: "completed" })
        .where(eq(transactionsTable.reference, transactionRef));
    }
  }

  if (eventType === "transfer_failed" || eventType === "payout_failed") {
    const transactionRef = event.Body?.transaction_ref ?? event.TransactionRef;
    if (transactionRef) {
      const transfer = await db.select().from(transfersTable)
        .where(eq(transfersTable.providerRef, transactionRef)).limit(1);

      if (transfer[0]) {
        const wallet = await db.select().from(walletsTable)
          .where(and(eq(walletsTable.userId, transfer[0].senderId), eq(walletsTable.type, transfer[0].identityType))).limit(1);
        if (wallet[0]) {
          await db.update(walletsTable).set({
            available: wallet[0].available + transfer[0].amount + transfer[0].fee,
            total: wallet[0].total + transfer[0].amount + transfer[0].fee,
          }).where(eq(walletsTable.id, wallet[0].id));
        }
        await db.update(transfersTable).set({ status: "failed" }).where(eq(transfersTable.id, transfer[0].id));
        await db.update(transactionsTable).set({ status: "failed" }).where(eq(transactionsTable.reference, transfer[0].id));
      }

      const withdrawal = await db.select().from(withdrawalsTable)
        .where(eq(withdrawalsTable.providerRef, transactionRef)).limit(1);

      if (withdrawal[0]) {
        const wallet = await db.select().from(walletsTable)
          .where(eq(walletsTable.userId, withdrawal[0].userId)).limit(1);
        if (wallet[0]) {
          await db.update(walletsTable).set({
            available: wallet[0].available + withdrawal[0].amount + withdrawal[0].fee,
            total: wallet[0].total + withdrawal[0].amount + withdrawal[0].fee,
          }).where(eq(walletsTable.id, wallet[0].id));
        }
        await db.update(withdrawalsTable).set({ status: "failed" }).where(eq(withdrawalsTable.id, withdrawal[0].id));
        await db.update(transactionsTable).set({ status: "failed" }).where(eq(transactionsTable.reference, withdrawal[0].id));
      }
    }
  }

  return res.status(200).json({ received: true });
});

router.post("/webhooks/wema", async (req, res) => {
  const apiKey = req.headers["x-api-key"] as string;
  if (apiKey !== process.env.WEMA_BANK_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Invalid webhook key" });
  }

  const event = req.body as {
    eventType?: string;
    trackingReference?: string;
    amount?: number;
    accountNumber?: string;
  };

  if (event.eventType === "CREDIT" || event.eventType === "VIRTUAL_ACCOUNT_CREDIT") {
    const userId = event.trackingReference?.replace("payrald_", "");
    const amountNgn = (event.amount ?? 0) / 100;

    if (userId) {
      const wallets = await db.select().from(walletsTable)
        .where(and(eq(walletsTable.userId, userId), eq(walletsTable.type, "Personal")));

      if (wallets[0]) {
        await db.update(walletsTable).set({
          total: wallets[0].total + amountNgn,
          available: wallets[0].available + amountNgn,
        }).where(eq(walletsTable.id, wallets[0].id));

        await db.insert(transactionsTable).values({
          id: randomUUID(),
          userId,
          type: "transfer_received",
          description: "Wallet top-up via Wema ALAT",
          counterpartyName: "Wema Bank",
          counterpartyAlias: event.accountNumber ?? "virtual_account",
          amount: amountNgn,
          fee: 0,
          currency: "NGN",
          direction: "credit",
          status: "completed",
          reference: `wema_${randomUUID()}`,
        });
      }
    }
  }

  return res.status(200).json({ received: true });
});

export default router;
