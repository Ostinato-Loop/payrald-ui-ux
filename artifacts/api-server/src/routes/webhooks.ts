import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transfersTable, withdrawalsTable, walletsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/webhooks/squad", async (req, res) => {
  const sig = req.headers["x-squad-encrypted-body"] as string;
  if (!sig) return res.status(400).json({ error: "Missing signature" });

  const event = req.body as {
    event: string;
    data: {
      transaction_ref: string;
      gateway_ref: string;
      status: string;
    };
  };

  const { event: eventType, data } = event;

  try {
    if (eventType === "transfer.success" || eventType === "transfer.failed") {
      const ref = data.transaction_ref;
      const newStatus = eventType === "transfer.success" ? "completed" : "failed";

      const transferPrefix = "pay_txfr_";
      const withdrawalPrefix = "pay_wdrl_";

      if (ref.startsWith(transferPrefix)) {
        const [transfer] = await db.select().from(transfersTable)
          .where(eq(transfersTable.providerRef, data.gateway_ref)).limit(1);
        if (transfer) {
          await db.update(transfersTable).set({ status: newStatus }).where(eq(transfersTable.id, transfer.id));
          await db.update(transactionsTable).set({ status: newStatus }).where(eq(transactionsTable.reference, transfer.id));

          if (eventType === "transfer.failed") {
            const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, transfer.senderId)).limit(1);
            if (wallet) {
              await db.update(walletsTable).set({
                available: wallet.available + transfer.amount,
                total: wallet.total + transfer.amount,
              }).where(eq(walletsTable.id, wallet.id));
            }
          }
        }
      }

      if (ref.startsWith(withdrawalPrefix)) {
        const [withdrawal] = await db.select().from(withdrawalsTable)
          .where(eq(withdrawalsTable.providerRef, data.gateway_ref)).limit(1);
        if (withdrawal) {
          await db.update(withdrawalsTable).set({ status: newStatus }).where(eq(withdrawalsTable.id, withdrawal.id));
          await db.update(transactionsTable).set({ status: newStatus }).where(eq(transactionsTable.reference, withdrawal.id));

          if (eventType === "transfer.failed") {
            const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, withdrawal.userId)).limit(1);
            if (wallet) {
              await db.update(walletsTable).set({
                available: wallet.available + withdrawal.amount + withdrawal.fee,
                total: wallet.total + withdrawal.amount + withdrawal.fee,
              }).where(eq(walletsTable.id, wallet.id));
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return res.json({ received: true });
});

export default router;
