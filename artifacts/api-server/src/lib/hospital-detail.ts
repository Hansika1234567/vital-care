import type { Hospital } from "@workspace/db";

const DOCTOR_NAMES = [
  "Dr. Rajesh Kumar",
  "Dr. Priya Sharma",
  "Dr. Anil Reddy",
  "Dr. Meera Iyer",
  "Dr. Suresh Gupta",
  "Dr. Lakshmi Devi",
  "Dr. Vikram Singh",
  "Dr. Kavitha Rao",
  "Dr. Arjun Menon",
  "Dr. Deepa Nair",
  "Dr. Ravi Chandra",
  "Dr. Sunita Patel",
  "Dr. Mohan Das",
  "Dr. Ananya Krishnan",
  "Dr. Harish Varma",
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
  "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
];

const SPECIALTY_FACILITIES: Record<string, string[]> = {
  Cardiology: ["Cardiac Cath Lab", "ECG & Echo Lab"],
  Neurology: ["Neuro ICU", "EEG Lab"],
  Orthopedics: ["Trauma Center", "Physiotherapy Unit"],
  Oncology: ["Chemotherapy Unit", "Radiation Therapy"],
  Pediatrics: ["Neonatal ICU", "Vaccination Center"],
  Gastroenterology: ["Endoscopy Suite"],
  Nephrology: ["Dialysis Center"],
  Pulmonology: ["Pulmonary Function Lab"],
  "General Surgery": ["Modular OT Complex"],
  Dermatology: ["Laser Treatment Unit"],
  Ophthalmology: ["Eye OT Suite"],
  Urology: ["Lithotripsy Unit"],
  ENT: ["Audiology Lab"],
  Psychiatry: ["Counseling Center"],
  "Emergency Medicine": ["Triage Bay", "Trauma Bay"],
};

function occupancyPercent(total: number, available: number): number {
  if (total <= 0) return 0;
  return Math.round(((total - available) / total) * 100);
}

function loadStatus(
  bedOccupancy: number,
  icuOccupancy: number,
): "Low Load" | "Medium Load" | "High Load" {
  const score = bedOccupancy * 0.6 + icuOccupancy * 0.4;
  if (score >= 85) return "High Load";
  if (score >= 60) return "Medium Load";
  return "Low Load";
}

function emergencyQueueStatus(
  availableBeds: number,
  emergencyAvailable: boolean,
): "Low" | "Moderate" | "High" {
  if (!emergencyAvailable) return "High";
  if (availableBeds >= 20) return "Low";
  if (availableBeds >= 5) return "Moderate";
  return "High";
}

function estimatedWaitingMinutes(
  availableBeds: number,
  load: "Low Load" | "Medium Load" | "High Load",
): number {
  const base =
    load === "High Load" ? 90 : load === "Medium Load" ? 45 : 20;
  const adjustment = Math.max(0, 15 - availableBeds) * 3;
  return base + adjustment;
}

function buildFacilities(hospital: Hospital): string[] {
  const facilities = new Set<string>([
    "24/7 Pharmacy",
    "Diagnostic Laboratory",
    "Blood Bank",
    "Digital Radiology",
    "Ambulatory Care",
  ]);

  if (hospital.emergencyAvailable) {
    facilities.add("24/7 Emergency Department");
  }
  if (hospital.ambulanceAvailable) {
    facilities.add("Ambulance Service");
  }
  if (hospital.totalICUBeds > 0) {
    facilities.add("Intensive Care Unit");
  }
  if (hospital.totalBeds >= 200) {
    facilities.add("Multi-Specialty Wards");
  }

  for (const specialty of hospital.specialties) {
    for (const facility of SPECIALTY_FACILITIES[specialty] ?? []) {
      facilities.add(facility);
    }
  }

  return [...facilities];
}

export function enrichHospitalDetail(hospital: Hospital) {
  const bedOccupancyPercent = occupancyPercent(
    hospital.totalBeds,
    hospital.availableBeds,
  );
  const icuOccupancyPercent = occupancyPercent(
    hospital.totalICUBeds,
    hospital.availableICUBeds,
  );
  const status = loadStatus(bedOccupancyPercent, icuOccupancyPercent);

  return {
    ...hospital,
    imageGallery: [
      hospital.imageUrl,
      ...GALLERY_IMAGES.slice(0, 3).map(
        (url, i) => GALLERY_IMAGES[(hospital.id + i) % GALLERY_IMAGES.length],
      ),
    ],
    specialists: hospital.specialties.map((specialty, index) => ({
      name: DOCTOR_NAMES[(hospital.id + index) % DOCTOR_NAMES.length],
      specialty,
      experienceYears: 5 + ((hospital.id * (index + 3)) % 25),
    })),
    facilities: buildFacilities(hospital),
    estimatedWaitingMinutes: estimatedWaitingMinutes(
      hospital.availableBeds,
      status,
    ),
    bedOccupancyPercent,
    icuOccupancyPercent,
    emergencyQueueStatus: emergencyQueueStatus(
      hospital.availableBeds,
      hospital.emergencyAvailable,
    ),
    loadStatus: status,
  };
}
