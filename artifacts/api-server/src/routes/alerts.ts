import { Router, type IRouter } from "express";
import { db, alertsTable, usersTable } from "@workspace/db";
import { eq, and, desc, ne } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  SendAlertBody,
  GetAlertsQueryParams,
  MarkAlertReadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alerts", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetAlertsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId, status } = params.data;
  const role = req.user!.role;

  // Doctors and admins see ALL patient alerts (not just their own)
  let rows;
  if (role === "doctor" || role === "hospital_admin") {
    // Get alerts only for patients (exclude other doctors/admins/caretakers)
    const patientUsers = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.role, "patient"));
    const patientIds = patientUsers.map(u => u.id);
    const patientMap = new Map(patientUsers.map(u => [u.id, u.name]));

    if (patientIds.length === 0) {
      res.json([]);
      return;
    }

    rows = await db.select().from(alertsTable)
      .orderBy(desc(alertsTable.createdAt));

    // Filter to only patient alerts
    const patientIdSet = new Set(patientIds);
    rows = rows.filter(a => patientIdSet.has(a.userId));

    // Attach patient names
    const enriched = rows.map(a => ({
      ...a,
      patientName: patientMap.get(a.userId) ?? "Unknown Patient",
    }));

    let result = enriched;
    if (status === "unread") result = enriched.filter(a => !a.isRead);
    else if (status === "read") result = enriched.filter(a => a.isRead);

    res.json(result);
    return;
  }

  // Regular patients/caretakers: only see their own
  const targetUserId = userId ?? req.user!.id;
  rows = await db.select().from(alertsTable)
    .where(eq(alertsTable.userId, targetUserId))
    .orderBy(desc(alertsTable.createdAt));

  if (status === "unread") {
    rows = rows.filter(a => !a.isRead);
  } else if (status === "read") {
    rows = rows.filter(a => a.isRead);
  }

  res.json(rows);
});

router.post("/alerts", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = SendAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [alert] = await db.insert(alertsTable).values({
    userId: parsed.data.userId,
    type: parsed.data.type,
    severity: parsed.data.severity,
    message: parsed.data.message,
    vitals: parsed.data.vitals ?? null,
    isRead: false,
    smsSent: false,
  }).returning();
  res.status(201).json(alert);
});

router.patch("/alerts/:alertId/read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.alertId) ? req.params.alertId[0] : req.params.alertId;
  const alertId = parseInt(raw, 10);
  if (isNaN(alertId)) {
    res.status(400).json({ error: "Invalid alert ID" });
    return;
  }

  const role = req.user!.role;

  // Doctors/admins can acknowledge any alert (not just their own)
  const whereClause = (role === "doctor" || role === "hospital_admin")
    ? eq(alertsTable.id, alertId)
    : and(eq(alertsTable.id, alertId), eq(alertsTable.userId, req.user!.id));

  const [updated] = await db.update(alertsTable)
    .set({ isRead: true })
    .where(whereClause)
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(updated);
});

export default router;
