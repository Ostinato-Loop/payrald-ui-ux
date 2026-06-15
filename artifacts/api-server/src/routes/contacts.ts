import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();
function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/contacts", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const rows = await db.select().from(contactsTable)
    .where(eq(contactsTable.userId, userId))
    .orderBy(desc(contactsTable.lastTransactionAt))
    .limit(20);
  return res.json(rows);
});

export default router;
