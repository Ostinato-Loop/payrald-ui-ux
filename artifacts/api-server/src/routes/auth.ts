import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const SignInBody = z.object({ raldId: z.string(), pin: z.string() });
const SignUpBody = z.object({
  raldId: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  pin: z.string().length(6),
  activatedTypes: z.array(z.string()).default(["Personal"]),
});

function getUserId(req: any): string | null {
  return req.headers.authorization?.replace("Bearer ", "") ?? null;
}

router.get("/auth/me", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user[0]) return res.status(401).json({ error: "Unauthorized" });
  const u = user[0];
  const wallets = await db.select().from(walletsTable).where(eq(walletsTable.userId, u.id));
  const personalWallet = wallets.find((w) => w.type === "Personal");
  return res.json({
    id: u.id,
    raldId: u.raldId,
    name: u.name,
    email: u.email,
    phone: u.phone,
    activatedTypes: u.activatedTypes,
    kycTier: u.kycTier,
    trustScore: u.trustScore,
    createdAt: u.createdAt,
    virtualAccountNumber: personalWallet?.virtualAccountNumber ?? null,
    virtualAccountBank: personalWallet?.virtualAccountBank ?? null,
  });
});

router.post("/auth/signin", async (req, res) => {
  const body = SignInBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });
  const user = await db.select().from(usersTable).where(eq(usersTable.raldId, body.data.raldId)).limit(1);
  if (!user[0]) return res.status(401).json({ error: "Invalid credentials" });
  const wallets = await db.select().from(walletsTable).where(eq(walletsTable.userId, user[0].id));
  const personalWallet = wallets.find((w) => w.type === "Personal");
  return res.json({
    user: {
      id: user[0].id,
      raldId: user[0].raldId,
      name: user[0].name,
      email: user[0].email,
      phone: user[0].phone,
      activatedTypes: user[0].activatedTypes,
      kycTier: user[0].kycTier,
      trustScore: user[0].trustScore,
      createdAt: user[0].createdAt,
      virtualAccountNumber: personalWallet?.virtualAccountNumber ?? null,
      virtualAccountBank: personalWallet?.virtualAccountBank ?? null,
    },
    token: user[0].id,
  });
});

router.post("/auth/signup", async (req, res) => {
  const body = SignUpBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body", details: body.error.flatten() });

  const existing = await db.select().from(usersTable).where(eq(usersTable.raldId, body.data.raldId)).limit(1);
  if (existing[0]) return res.status(409).json({ error: "RALD ID already taken" });

  const id = randomUUID();
  const [user] = await db.insert(usersTable).values({
    id,
    raldId: body.data.raldId,
    name: body.data.name,
    email: body.data.email ?? null,
    phone: body.data.phone ?? null,
    pinHash: body.data.pin,
    kycTier: 1,
    trustScore: 85.0,
    activatedTypes: body.data.activatedTypes,
  }).returning();

  const walletInserts: typeof walletsTable.$inferInsert[] = [
    { id: randomUUID(), userId: user.id, type: "Personal", total: 0, available: 0, pending: 0 },
  ];
  if (body.data.activatedTypes.includes("Business")) {
    walletInserts.push({ id: randomUUID(), userId: user.id, type: "Business", total: 0, available: 0, pending: 0 });
  }
  if (body.data.activatedTypes.includes("Network")) {
    walletInserts.push({ id: randomUUID(), userId: user.id, type: "Network", total: 0, available: 0, pending: 0 });
  }
  await db.insert(walletsTable).values(walletInserts);

  return res.status(201).json({
    user: {
      id: user.id,
      raldId: user.raldId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      activatedTypes: user.activatedTypes,
      kycTier: user.kycTier,
      trustScore: user.trustScore,
      createdAt: user.createdAt,
      virtualAccountNumber: null,
      virtualAccountBank: null,
    },
    token: user.id,
  });
});

router.post("/auth/signout", (_req, res) => {
  return res.status(204).send();
});

export default router;
