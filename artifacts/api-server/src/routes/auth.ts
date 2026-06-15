import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashPin(pin: string): string {
  return createHash("sha256").update(pin + "rald-payrald-salt").digest("hex");
}

const SignUpBody = z.object({
  raldId: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/),
  name: z.string().min(2).max(80),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  pin: z.string().length(6).regex(/^\d{6}$/),
});

const SignInBody = z.object({
  raldId: z.string().min(1),
  pin: z.string().length(6),
});

router.post("/auth/signup", async (req, res) => {
  const body = SignUpBody.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: "Invalid input", details: body.error.flatten() });
  }

  const { raldId, name, email, phone, pin } = body.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.raldId, raldId)).limit(1);
  if (existing[0]) {
    return res.status(409).json({ error: "RALD ID already taken" });
  }

  const id = randomUUID();
  const [user] = await db.insert(usersTable).values({
    id,
    raldId,
    name,
    email: email ?? null,
    phone: phone ?? null,
    pinHash: hashPin(pin),
    kycTier: 1,
    trustScore: 85.0,
    activatedTypes: ["Personal"],
  }).returning();

  await db.insert(walletsTable).values({
    id: randomUUID(),
    userId: id,
    type: "Personal",
    total: 0,
    available: 0,
    pending: 0,
    currency: "NGN",
  });

  const { pinHash: _, ...safeUser } = user;
  return res.status(201).json({ user: safeUser, token: id });
});

router.post("/auth/signin", async (req, res) => {
  const body = SignInBody.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { raldId, pin } = body.data;

  const users = await db.select().from(usersTable).where(eq(usersTable.raldId, raldId)).limit(1);
  if (!users[0]) {
    return res.status(401).json({ error: "Invalid RALD ID or PIN" });
  }

  if (users[0].pinHash !== hashPin(pin)) {
    return res.status(401).json({ error: "Invalid RALD ID or PIN" });
  }

  const { pinHash: _, ...safeUser } = users[0];
  return res.json({ user: safeUser, token: users[0].id });
});

router.get("/auth/me", async (req, res) => {
  const userId = req.headers.authorization?.replace("Bearer ", "");
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!users[0]) return res.status(401).json({ error: "User not found" });

  const { pinHash: _, ...safeUser } = users[0];
  return res.json(safeUser);
});

export default router;
