import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SignInBody, SignUpBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/auth/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const user = await db.select().from(usersTable).where(eq(usersTable.id, token)).limit(1);
  if (!user[0]) return res.status(401).json({ error: "Unauthorized" });
  const u = user[0];
  return res.json({
    id: u.id, raldId: u.raldId, name: u.name, email: u.email, phone: u.phone,
    activatedTypes: u.activatedTypes, kycTier: u.kycTier, trustScore: u.trustScore,
    createdAt: u.createdAt,
  });
});

router.post("/auth/signin", async (req, res) => {
  const body = SignInBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });
  const user = await db.select().from(usersTable).where(eq(usersTable.raldId, body.data.raldId)).limit(1);
  if (!user[0]) return res.status(401).json({ error: "Invalid credentials" });
  return res.json({
    user: {
      id: user[0].id, raldId: user[0].raldId, name: user[0].name,
      email: user[0].email, phone: user[0].phone,
      activatedTypes: user[0].activatedTypes, kycTier: user[0].kycTier,
      trustScore: user[0].trustScore, createdAt: user[0].createdAt,
    },
    token: user[0].id,
  });
});

router.post("/auth/signup", async (req, res) => {
  const body = SignUpBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });
  const existing = await db.select().from(usersTable).where(eq(usersTable.raldId, body.data.raldId)).limit(1);
  if (existing[0]) return res.status(409).json({ error: "RALD ID already taken" });
  const id = randomUUID();
  const [user] = await db.insert(usersTable).values({
    id, raldId: body.data.raldId, name: body.data.name,
    email: body.data.email ?? null, phone: body.data.phone ?? null,
    pinHash: body.data.pin, kycTier: 1, trustScore: 85.0,
    activatedTypes: body.data.activatedTypes,
  }).returning();
  return res.status(201).json({
    user: {
      id: user.id, raldId: user.raldId, name: user.name,
      email: user.email, phone: user.phone,
      activatedTypes: user.activatedTypes, kycTier: user.kycTier,
      trustScore: user.trustScore, createdAt: user.createdAt,
    },
    token: user.id,
  });
});

router.post("/auth/signout", (_req, res) => {
  return res.status(204).send();
});

export default router;
