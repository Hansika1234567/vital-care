import {
  pgTable,
  text,
  serial,
  real,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  specialties: text("specialties").array().notNull().default([]),
  totalBeds: integer("total_beds").notNull().default(0),
  availableBeds: integer("available_beds").notNull().default(0),
  totalICUBeds: integer("total_icu_beds").notNull().default(0),
  availableICUBeds: integer("available_icu_beds").notNull().default(0),
  emergencyAvailable: boolean("emergency_available").notNull().default(true),
  ambulanceAvailable: boolean("ambulance_available").notNull().default(true),
  rating: real("rating"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertHospitalSchema = createInsertSchema(hospitalsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitalsTable.$inferSelect;
