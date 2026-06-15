import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, merchantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ResolveIdentityBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/resolve", async (req, res) => {
  const body = ResolveIdentityBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });
  const { alias } = body.data;

  if (alias.startsWith("@")) {
    const handle = alias.slice(1);
    const merchant = await db.select().from(merchantsTable).where(eq(merchantsTable.handle, handle)).limit(1);
    if (merchant[0]) {
      return res.json({
        alias, aliasType: "merchant", displayName: merchant[0].name,
        avatarInitials: merchant[0].name.slice(0, 2).toUpperCase(),
        verified: merchant[0].verified, merchantHandle: merchant[0].handle,
      });
    }
    const user = await db.select().from(usersTable).where(eq(usersTable.raldId, handle)).limit(1);
    if (user[0]) {
      return res.json({
        alias, aliasType: "username", displayName: user[0].name,
        avatarInitials: user[0].name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        verified: user[0].kycTier >= 2, merchantHandle: null,
      });
    }
  } else if (alias.includes("@") && alias.includes(".")) {
    const [handle, domain] = alias.split("@");
    const merchantHandle = handle;
    const merchant = await db.select().from(merchantsTable).where(eq(merchantsTable.handle, merchantHandle)).limit(1);
    if (merchant[0]) {
      return res.json({
        alias, aliasType: "merchant", displayName: merchant[0].name,
        avatarInitials: merchant[0].name.slice(0, 2).toUpperCase(),
        verified: merchant[0].verified, merchantHandle: merchant[0].handle,
      });
    }
    const user = await db.select().from(usersTable).where(eq(usersTable.email, alias)).limit(1);
    if (user[0]) {
      return res.json({
        alias, aliasType: "email", displayName: user[0].name,
        avatarInitials: user[0].name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        verified: true, merchantHandle: null,
      });
    }
  } else if (alias.startsWith("+")) {
    const user = await db.select().from(usersTable).where(eq(usersTable.phone, alias)).limit(1);
    if (user[0]) {
      return res.json({
        alias, aliasType: "phone", displayName: user[0].name,
        avatarInitials: user[0].name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        verified: true, merchantHandle: null,
      });
    }
    return res.json({
      alias, aliasType: "phone", displayName: alias,
      avatarInitials: "??", verified: false, merchantHandle: null,
    });
  }

  return res.status(404).json({ error: "Identity not found" });
});

export default router;
