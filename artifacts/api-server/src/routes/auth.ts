import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../lib/auth";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, role, phone, caretakerPhone } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, role,
    phone: phone ?? null,
    caretakerPhone: caretakerPhone ?? null,
  }).returning();

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      phone: user.phone, caretakerPhone: user.caretakerPhone,
      avatarUrl: user.avatarUrl, createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      phone: user.phone, caretakerPhone: user.caretakerPhone,
      avatarUrl: user.avatarUrl, createdAt: user.createdAt,
    },
  });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    phone: user.phone, caretakerPhone: user.caretakerPhone,
    avatarUrl: user.avatarUrl, createdAt: user.createdAt,
  });
});

router.patch("/users/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { name, phone, caretakerPhone } = req.body;
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    res.status(400).json({ error: "Name must be at least 2 characters" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone || null;
  if (caretakerPhone !== undefined) updates.caretakerPhone = caretakerPhone || null;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.user!.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    phone: user.phone, caretakerPhone: user.caretakerPhone,
    avatarUrl: user.avatarUrl, createdAt: user.createdAt,
  });
});

router.delete("/users/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  await db.delete(usersTable).where(eq(usersTable.id, req.user!.id));
  res.status(204).send();
});

export default router;
