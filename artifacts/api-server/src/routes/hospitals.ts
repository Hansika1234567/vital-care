import { Router, type IRouter } from "express";
import { db, hospitalsTable } from "@workspace/db";
import { eq, and, sql, gt } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { requireRole } from "../lib/roles";
import { enrichHospitalDetail } from "../lib/hospital-detail";
import {
  CreateHospitalBody,
  GetHospitalsQueryParams,
  GetHospitalParams,
  UpdateHospitalParams,
  UpdateHospitalBody,
  DeleteHospitalParams,
  UpdateHospitalAvailabilityParams,
  UpdateHospitalAvailabilityBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/hospitals", requireAuth, async (req, res): Promise<void> => {
  const params = GetHospitalsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, city, specialty, hasBeds, hasIcu, emergencyAvailable } =
    params.data;

  const conditions = [];

  if (search) {
    const term = `%${search.toLowerCase()}%`;
    conditions.push(
      sql`(lower(${hospitalsTable.name}) like ${term} or lower(${hospitalsTable.city}) like ${term} or lower(${hospitalsTable.address}) like ${term})`,
    );
  }

  if (city) {
    conditions.push(
      sql`lower(${hospitalsTable.city}) = ${city.toLowerCase()}`,
    );
  }

  if (specialty) {
    conditions.push(sql`${specialty} = ANY(${hospitalsTable.specialties})`);
  }

  if (hasBeds === true) {
    conditions.push(gt(hospitalsTable.availableBeds, 0));
  }

  if (hasIcu === true) {
    conditions.push(gt(hospitalsTable.availableICUBeds, 0));
  }

  if (emergencyAvailable === true) {
    conditions.push(eq(hospitalsTable.emergencyAvailable, true));
  }

  const hospitals =
    conditions.length > 0
      ? await db
          .select()
          .from(hospitalsTable)
          .where(and(...conditions))
      : await db.select().from(hospitalsTable);

  res.json(hospitals);
});

router.post(
  "/hospitals",
  requireAuth,
  requireRole("hospital_admin"),
  async (req: AuthRequest, res): Promise<void> => {
    const parsed = CreateHospitalBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [hospital] = await db
      .insert(hospitalsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(hospital);
  },
);

router.get(
  "/hospitals/:hospitalId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetHospitalParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [hospital] = await db
      .select()
      .from(hospitalsTable)
      .where(eq(hospitalsTable.id, params.data.hospitalId));

    if (!hospital) {
      res.status(404).json({ error: "Hospital not found" });
      return;
    }

    res.json(enrichHospitalDetail(hospital));
  },
);

router.put(
  "/hospitals/:hospitalId",
  requireAuth,
  requireRole("hospital_admin"),
  async (req: AuthRequest, res): Promise<void> => {
    const params = UpdateHospitalParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdateHospitalBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [hospital] = await db
      .update(hospitalsTable)
      .set(parsed.data)
      .where(eq(hospitalsTable.id, params.data.hospitalId))
      .returning();

    if (!hospital) {
      res.status(404).json({ error: "Hospital not found" });
      return;
    }

    res.json(hospital);
  },
);

router.delete(
  "/hospitals/:hospitalId",
  requireAuth,
  requireRole("hospital_admin"),
  async (req: AuthRequest, res): Promise<void> => {
    const params = DeleteHospitalParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [deleted] = await db
      .delete(hospitalsTable)
      .where(eq(hospitalsTable.id, params.data.hospitalId))
      .returning({ id: hospitalsTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Hospital not found" });
      return;
    }

    res.status(204).send();
  },
);

router.put(
  "/hospitals/:hospitalId/availability",
  requireAuth,
  requireRole("hospital_admin"),
  async (req: AuthRequest, res): Promise<void> => {
    const params = UpdateHospitalAvailabilityParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = UpdateHospitalAvailabilityBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(hospitalsTable)
      .where(eq(hospitalsTable.id, params.data.hospitalId));

    if (!existing) {
      res.status(404).json({ error: "Hospital not found" });
      return;
    }

    if (parsed.data.availableBeds > existing.totalBeds) {
      res.status(400).json({ error: "Available beds cannot exceed total beds" });
      return;
    }

    if (parsed.data.availableICUBeds > existing.totalICUBeds) {
      res
        .status(400)
        .json({ error: "Available ICU beds cannot exceed total ICU beds" });
      return;
    }

    const [hospital] = await db
      .update(hospitalsTable)
      .set({
        availableBeds: parsed.data.availableBeds,
        availableICUBeds: parsed.data.availableICUBeds,
      })
      .where(eq(hospitalsTable.id, params.data.hospitalId))
      .returning();

    res.json(hospital);
  },
);

export default router;
