import type { ProfessionalBooking, ProfessionalCaregiver, ProfessionalReview } from "@/types";
import { supabase } from "@/lib/supabase";
import { readJSON, uid, writeJSON } from "@/lib/utils";

const PROS_KEY = "meditrack.pro_caregivers";
const BOOKINGS_KEY = "meditrack.pro_bookings";
const REVIEWS_KEY = "meditrack.pro_reviews";

// Verified Initial Professional Caregivers for the marketplace
const SEED_PROFESSIONALS: ProfessionalCaregiver[] = [
  {
    id: "pro-1",
    userId: "user-pro-1",
    fullName: "Elena Rostova, RN",
    email: "elena.rn@meditrack.care",
    phone: "(555) 234-5678",
    bio: "Registered Nurse with over 8 years of intensive geriatric care, diabetes medication management, and post-surgery patient support.",
    qualifications: "BSN, Registered Nurse (RN), BLS/ACLS Certified",
    yearsExperience: 8,
    languages: ["English", "Spanish"],
    serviceLocation: "New York, NY",
    hourlyRate: 48.00,
    verificationStatus: "verified",
    rating: 4.95,
    reviewCount: 42,
    availability: "weekdays_and_weekends",
    avatarUrl: "/images/illustrations/health-wellness.png",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "pro-2",
    userId: "user-pro-2",
    fullName: "Marcus Holloway, CNA",
    email: "marcus.cna@meditrack.care",
    phone: "(555) 345-6789",
    bio: "Compassionate Certified Nursing Assistant specialized in Parkinson's, Alzheimer's daily routines, mobility assistance, and medication timing.",
    qualifications: "Certified Nursing Assistant (CNA), Dementia Care Specialist",
    yearsExperience: 5,
    languages: ["English"],
    serviceLocation: "Chicago, IL",
    hourlyRate: 36.00,
    verificationStatus: "verified",
    rating: 4.88,
    reviewCount: 29,
    availability: "weekdays",
    avatarUrl: "/images/illustrations/family-care.png",
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "pro-3",
    userId: "user-pro-3",
    fullName: "Dr. Ananya Sharma, PT",
    email: "ananya.pt@meditrack.care",
    phone: "(555) 456-7890",
    bio: "Physical therapist and home health manager dedicated to senior balance training, stroke recovery routines, and strict medicine timetable adherence.",
    qualifications: "Doctor of Physical Therapy (DPT), Geriatric Clinical Specialist",
    yearsExperience: 11,
    languages: ["English", "Hindi"],
    serviceLocation: "San Francisco, CA",
    hourlyRate: 65.00,
    verificationStatus: "verified",
    rating: 5.00,
    reviewCount: 38,
    availability: "weekdays_and_weekends",
    avatarUrl: "/images/illustrations/health-wellness.png",
    createdAt: "2026-01-05T10:00:00Z",
  },
  {
    id: "pro-4",
    userId: "user-pro-4",
    fullName: "David Chen, LPN",
    email: "david.chen@meditrack.care",
    phone: "(555) 567-8901",
    bio: "Licensed Practical Nurse experienced in chronic pain regimens, wound dressing changes, and coordinating family updates.",
    qualifications: "Licensed Practical Nurse (LPN), IV Therapy Certified",
    yearsExperience: 6,
    languages: ["English", "Mandarin"],
    serviceLocation: "Austin, TX",
    hourlyRate: 42.00,
    verificationStatus: "verified",
    rating: 4.90,
    reviewCount: 19,
    availability: "weekends",
    avatarUrl: "/images/illustrations/elderly-couple.png",
    createdAt: "2026-03-01T11:00:00Z",
  },
];

export async function getProfessionalCaregivers(): Promise<ProfessionalCaregiver[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("professional_caregivers")
        .select("*")
        .order("rating", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          fullName: row.full_name,
          phone: row.phone,
          bio: row.bio,
          qualifications: row.qualifications,
          yearsExperience: row.years_experience,
          languages: row.languages || ["English"],
          serviceLocation: row.service_location,
          hourlyRate: Number(row.hourly_rate),
          verificationStatus: row.verification_status,
          rating: Number(row.rating),
          reviewCount: row.review_count,
          availability: row.availability,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
        }));
      }
    } catch {}
  }

  // Fallback to local storage seeded professionals
  const local = readJSON<ProfessionalCaregiver[]>(PROS_KEY, []);
  if (local.length === 0) {
    writeJSON(PROS_KEY, SEED_PROFESSIONALS);
    return SEED_PROFESSIONALS;
  }
  return local;
}

export async function getBookingsForUser(userId: string): Promise<ProfessionalBooking[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("professional_bookings")
        .select("*, patient:patient_id(name), caregiver:caregiver_id(name)")
        .or(`patient_id.eq.${userId},caregiver_id.eq.${userId}`)
        .order("scheduled_date", { ascending: false });

      if (!error && data) {
        return data.map((b) => ({
          id: b.id,
          patientId: b.patient_id,
          caregiverId: b.caregiver_id,
          patientName: b.patient?.name || "Patient",
          caregiverName: b.caregiver?.name || "Caregiver",
          serviceType: b.service_type,
          scheduledDate: b.scheduled_date,
          scheduledTime: b.scheduled_time,
          durationMinutes: b.duration_minutes,
          hourlyRate: Number(b.hourly_rate),
          totalAmount: Number(b.total_amount),
          careRequirements: b.care_requirements,
          status: b.status,
          patientContactPhone: b.patient_contact_phone,
          serviceAddress: b.service_address,
          createdAt: b.created_at,
        }));
      }
    } catch {}
  }

  return readJSON<ProfessionalBooking[]>(BOOKINGS_KEY, [
    {
      id: "book-demo-1",
      patientId: userId,
      caregiverId: "user-pro-1",
      patientName: "Eleanor Vance",
      caregiverName: "Elena Rostova, RN",
      serviceType: "visit",
      scheduledDate: "2026-11-05",
      scheduledTime: "11:00",
      durationMinutes: 60,
      hourlyRate: 48.00,
      totalAmount: 48.00,
      careRequirements: "Check blood sugar adherence and assist with post-lunch insulin dose confirmation.",
      status: "confirmed",
      patientContactPhone: "(555) 789-0123",
      serviceAddress: "128 Orchard Way, Apt 4B",
      createdAt: new Date().toISOString(),
    },
  ]);
}

export async function createBooking(input: Omit<ProfessionalBooking, "id" | "createdAt" | "totalAmount">): Promise<ProfessionalBooking> {
  const totalAmount = Number(((input.durationMinutes / 60) * input.hourlyRate).toFixed(2));
  const booking: ProfessionalBooking = {
    ...input,
    id: uid(),
    totalAmount,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from("professional_bookings").insert({
        patient_id: input.patientId,
        caregiver_id: input.caregiverId,
        service_type: input.serviceType,
        scheduled_date: input.scheduledDate,
        scheduled_time: input.scheduledTime,
        duration_minutes: input.durationMinutes,
        hourly_rate: input.hourlyRate,
        total_amount: totalAmount,
        care_requirements: input.careRequirements,
        status: input.status,
        patient_contact_phone: input.patientContactPhone,
        service_address: input.serviceAddress,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          patientId: data.patient_id,
          caregiverId: data.caregiver_id,
          serviceType: data.service_type,
          scheduledDate: data.scheduled_date,
          scheduledTime: data.scheduled_time,
          durationMinutes: data.duration_minutes,
          hourlyRate: Number(data.hourly_rate),
          totalAmount: Number(data.total_amount),
          status: data.status,
          careRequirements: data.care_requirements,
          patientContactPhone: data.patient_contact_phone,
          serviceAddress: data.service_address,
          createdAt: data.created_at,
        };
      }
    } catch {}
  }

  const existing = readJSON<ProfessionalBooking[]>(BOOKINGS_KEY, []);
  writeJSON(BOOKINGS_KEY, [booking, ...existing]);
  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: ProfessionalBooking["status"],
): Promise<void> {
  if (supabase) {
    try {
      await supabase.from("professional_bookings").update({ status }).eq("id", bookingId);
    } catch {}
  }

  const list = readJSON<ProfessionalBooking[]>(BOOKINGS_KEY, []);
  writeJSON(
    BOOKINGS_KEY,
    list.map((b) => (b.id === bookingId ? { ...b, status } : b)),
  );
}

export function getReviewsForCaregiver(caregiverId: string): ProfessionalReview[] {
  const all = readJSON<ProfessionalReview[]>(REVIEWS_KEY, [
    {
      id: "rev-1",
      caregiverId: "user-pro-1",
      reviewerId: "rev-user-1",
      reviewerName: "Arthur Vance (Family)",
      rating: 5,
      comment: "Elena was punctual, compassionate, and double-checked all morning meds with precision. Reassuring for our whole family.",
      createdAt: "2026-10-24T14:30:00Z",
    },
    {
      id: "rev-2",
      caregiverId: "user-pro-1",
      reviewerId: "rev-user-2",
      reviewerName: "Dorothy Miller",
      rating: 5,
      comment: "Warm and caring nurse. Made sure I took my blood pressure medicine after a good meal. Highly recommended!",
      createdAt: "2026-10-18T10:15:00Z",
    },
  ]);

  return all.filter((r) => r.caregiverId === caregiverId);
}
