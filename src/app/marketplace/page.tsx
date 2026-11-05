"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Heart,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import type { ProfessionalBooking, ProfessionalCaregiver, ProfessionalReview, UserRole } from "@/types";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  createBooking,
  getBookingsForUser,
  getProfessionalCaregivers,
  getReviewsForCaregiver,
  updateBookingStatus,
} from "@/services/professional-care-service";
import { getActiveUser } from "@/lib/auth";
import { formatTime } from "@/utils/date-utils";
import Image from "next/image";
import { useTranslation } from "@/i18n/LanguageContext";

export default function MarketplacePage() {
  const { t, isNepali, formatNumber, formatTimeDisplay } = useTranslation();
  const [caregivers, setCaregivers] = useState<ProfessionalCaregiver[]>([]);
  const [bookings, setBookings] = useState<ProfessionalBooking[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState<number>(0);
  const [maxRateFilter, setMaxRateFilter] = useState<number>(100);

  // Active view tab: "browse" | "bookings" | "workspace"
  const [viewTab, setViewTab] = useState<"browse" | "bookings" | "workspace">("browse");

  // Booking Modal
  const [bookingTarget, setBookingTarget] = useState<ProfessionalCaregiver | null>(null);
  const [serviceType, setServiceType] = useState<"visit" | "call" | "checkin">("visit");
  const [schedDate, setSchedDate] = useState("2026-11-06");
  const [schedTime, setSchedTime] = useState("10:00");
  const [duration, setDuration] = useState<number>(60);
  const [careRequirements, setCareRequirements] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Selected Profile for Reviews & Detail Modal
  const [profileDetail, setProfileDetail] = useState<ProfessionalCaregiver | null>(null);
  const [profileReviews, setProfileReviews] = useState<ProfessionalReview[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = await getActiveUser();
      const current = user || { id: "demo-user-1", name: "Eleanor Vance", role: "patient" as UserRole };
      setCurrentUser(current);

      const [pros, userBookings] = await Promise.all([
        getProfessionalCaregivers(),
        getBookingsForUser(current.id),
      ]);

      setCaregivers(pros);
      setBookings(userBookings);

      // If user registered as professional caregiver, default to workspace
      if (current.role === "professional_caregiver") {
        setViewTab("workspace");
      }

      setLoading(false);
    }
    void loadData();
  }, []);

  const locations = useMemo(() => {
    const set = new Set(caregivers.map((c) => c.serviceLocation));
    return ["all", ...Array.from(set)];
  }, [caregivers]);

  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((c) => {
      const matchQuery =
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.qualifications.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLocation = locationFilter === "all" || c.serviceLocation === locationFilter;
      const matchExp = c.yearsExperience >= experienceFilter;
      const matchRate = c.hourlyRate <= maxRateFilter;
      return matchQuery && matchLocation && matchExp && matchRate;
    });
  }, [caregivers, searchQuery, locationFilter, experienceFilter, maxRateFilter]);

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingTarget || !currentUser) return;

    await createBooking({
      patientId: currentUser.id,
      caregiverId: bookingTarget.userId,
      patientName: currentUser.name || "Patient",
      caregiverName: bookingTarget.fullName,
      serviceType,
      scheduledDate: schedDate,
      scheduledTime: schedTime,
      durationMinutes: duration,
      hourlyRate: bookingTarget.hourlyRate,
      careRequirements: careRequirements || "Medication check-in & general health reassurance",
      status: "requested",
      patientContactPhone: patientPhone || undefined,
      serviceAddress: serviceAddress || undefined,
    });

    const refreshed = await getBookingsForUser(currentUser.id);
    setBookings(refreshed);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingTarget(null);
      setViewTab("bookings");
    }, 1800);
  }

  function openProfile(pro: ProfessionalCaregiver) {
    setProfileDetail(pro);
    setProfileReviews(getReviewsForCaregiver(pro.userId));
  }

  return (
    <PageShell
      title={t.marketplace.pageTitle}
      subtitle={t.marketplace.pageSubtitle}
      action={
        currentUser?.role === "professional_caregiver" ? (
          <span className="font-mono text-xs font-bold text-[#20D6C2] bg-[#20D6C2]/10 border border-[#20D6C2]/30 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-xs">
            {isNepali ? "कार्यस्थान सक्रिय" : "Pro Workspace"}
          </span>
        ) : undefined
      }
    >
      <div className="space-y-7">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewTab("browse")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewTab === "browse"
                  ? "border border-[#20D6C2] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20D6C2] shadow-[0_0_15px_rgba(32,214,194,0.2)]"
                  : "border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#20D6C2]/40"
              }`}
            >
              <Search className="inline-block h-3.5 w-3.5 mr-1.5" />
              {t.marketplace.tabBrowse} ({formatNumber(filteredCaregivers.length)})
            </button>

            <button
              onClick={() => setViewTab("bookings")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewTab === "bookings"
                  ? "border border-[#20D6C2] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20D6C2] shadow-[0_0_15px_rgba(32,214,194,0.2)]"
                  : "border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#20D6C2]/40"
              }`}
            >
              <Calendar className="inline-block h-3.5 w-3.5 mr-1.5" />
              {t.marketplace.tabBookings} ({formatNumber(bookings.length)})
            </button>

            {currentUser?.role === "professional_caregiver" && (
              <button
                onClick={() => setViewTab("workspace")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  viewTab === "workspace"
                    ? "border border-[#20D6C2] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20D6C2] shadow-[0_0_15px_rgba(32,214,194,0.2)]"
                    : "border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#20D6C2]/40"
                }`}
              >
                <Briefcase className="inline-block h-3.5 w-3.5 mr-1.5" />
                {t.marketplace.tabWorkspace}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck className="h-4 w-4 text-[#20D6C2]" />
            <span>
              {isNepali
                ? "१००% प्रमाणित र पृष्ठभूमि जाँच गरिएका स्वास्थ्यकर्मीहरू"
                : "100% Background-Checked Healthcare Professionals"}
            </span>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: BROWSE CAREGIVERS
           ========================================================================= */}
        {viewTab === "browse" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <Card className="p-5">
              <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.marketplace.searchPlaceholder}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-9 pr-3.5 py-2.5 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                  />
                </div>

                <div>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                  >
                    <option value="all">{isNepali ? "सबै स्थानहरू" : "All Locations"}</option>
                    {locations.filter((l) => l !== "all").map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(Number(e.target.value))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                  >
                    <option value={0}>{isNepali ? "कुनै पनि अनुभव" : "Any Experience"}</option>
                    <option value={3}>{isNepali ? "३+ वर्ष अनुभव" : "3+ Years Exp"}</option>
                    <option value={5}>{isNepali ? "५+ वर्ष अनुभव" : "5+ Years Exp"}</option>
                    <option value={8}>{isNepali ? "८+ वर्ष अनुभव" : "8+ Years Exp"}</option>
                  </select>
                </div>

                <div>
                  <select
                    value={maxRateFilter}
                    onChange={(e) => setMaxRateFilter(Number(e.target.value))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                  >
                    <option value={100}>{isNepali ? "अधिकतम: $१००/घण्टा" : "Max: $100/hr"}</option>
                    <option value={60}>{isNepali ? "$६०/घण्टा मुनि" : "Under $60/hr"}</option>
                    <option value={45}>{isNepali ? "$४५/घण्टा मुनि" : "Under $45/hr"}</option>
                    <option value={35}>{isNepali ? "$३५/घण्टा मुनि" : "Under $35/hr"}</option>
                  </select>
                </div>
              </div>
            </Card>


            {/* Caregivers Grid */}
            <div className="grid gap-5 md:grid-cols-2">
              {filteredCaregivers.map((pro) => (
                <Card
                  key={pro.id}
                  interactive={true}
                  className="p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-[#16A36A]/20 border border-[#20D6C2]/30 p-1 flex items-center justify-center overflow-hidden">
                          {pro.avatarUrl ? (
                            <Image src={pro.avatarUrl} alt={pro.fullName} width={48} height={48} className="object-cover rounded-xl" />
                          ) : (
                            <span className="font-display font-bold text-lg text-[#20D6C2]">
                              {pro.fullName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display text-base font-bold text-[var(--text)]">
                              {pro.fullName}
                            </h3>
                            {pro.verificationStatus === "verified" && (
                              <BadgeCheck className="h-4 w-4 text-[#20D6C2] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#16A36A] dark:text-[#A3EAC1] font-semibold">
                            {pro.qualifications}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xl font-bold text-[#20D6C2]">
                          ${formatNumber(pro.hourlyRate)}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block">/ {t.marketplace.perHour}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {pro.bio}
                    </p>

                    {/* Meta badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                      <span className="flex items-center gap-1 text-[var(--text)]">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <strong className="text-[var(--text)]">{formatNumber(pro.rating.toFixed(2))}</strong> ({formatNumber(pro.reviewCount)} {isNepali ? "समीक्षाहरू" : "reviews"})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#20D6C2]" /> {pro.serviceLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-[#16A36A]" /> {formatNumber(pro.yearsExperience)} {t.marketplace.yearsExp}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openProfile(pro)}
                      className="text-xs"
                    >
                      {t.marketplace.viewProfileBtn}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setBookingTarget(pro);
                        setSchedDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
                      }}
                      className="text-xs font-bold"
                    >
                      {t.marketplace.bookCaregiverBtn}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {filteredCaregivers.length === 0 && (
              <Card className="text-center p-12 border border-dashed border-[var(--border)]">
                <Search className="mx-auto h-12 w-12 text-[var(--text-muted)] opacity-50" />
                <h3 className="mt-3 font-display text-base font-bold text-[var(--text)]">{t.marketplace.noCaregiversMatch}</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {isNepali ? "फिल्टर हटाएर वा अन्य सेवा स्थान छानेर हेर्नुहोस्।" : "Try clearing your filters or selecting a different service location."}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: MY BOOKINGS
           ========================================================================= */}
        {viewTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                {t.marketplace.myBookingsTitle} ({formatNumber(bookings.length)})
              </h2>
            </div>

            {bookings.length === 0 ? (
              <Card className="text-center p-10 border border-dashed border-[var(--border)]">
                <Calendar className="mx-auto h-12 w-12 text-[var(--text-muted)] opacity-50" />
                <h3 className="mt-3 font-display text-base font-bold text-[var(--text)]">{t.marketplace.noBookingsYet}</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {isNepali ? "तपाईंले अहिलेसम्म कुनै हेरचाहकर्ता बुक गर्नुभएको छैन।" : "You haven't booked any caregiver check-ins yet."}
                </p>
                <Button size="sm" variant="primary" onClick={() => setViewTab("browse")} className="mt-4 text-xs">
                  {t.marketplace.tabBrowse}
                </Button>
              </Card>
            ) : (
              <div className="space-y-3.5">
                {bookings.map((b) => (
                  <Card key={b.id} interactive={true} className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 basis-64">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "confirmed"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                              : b.status === "completed"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/25"
                              : b.status === "cancelled"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/25"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                          }`}
                        >
                          {b.status === "confirmed"
                            ? (isNepali ? "पुष्टि भएको" : "Confirmed")
                            : b.status === "completed"
                            ? (isNepali ? "सम्पन्न" : "Completed")
                            : b.status === "cancelled"
                            ? (isNepali ? "रद्द गरिएको" : "Cancelled")
                            : (isNepali ? "अनुरोध गरिएको" : "Requested")}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono capitalize">
                          &bull; {b.serviceType === "visit" ? t.marketplace.serviceTypeVisit : b.serviceType === "call" ? t.marketplace.serviceTypeCall : t.marketplace.serviceTypeCheckin} ({formatNumber(b.durationMinutes)}m)
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-[var(--text)]">
                        {b.caregiverName || (isNepali ? "व्यावसायिक हेरचाहकर्ता" : "Professional Caregiver")}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {b.careRequirements}
                      </p>

                      <div className="mt-2 flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                        <span>{t.marketplace.serviceDate}: <strong className="text-[var(--text)]">{b.scheduledDate}</strong></span>
                        <span>{t.marketplace.serviceTime}: <strong className="text-[var(--text)]">{formatTimeDisplay(b.scheduledTime)}</strong></span>
                        <span>{isNepali ? "रकम" : "Rate"}: <strong className="text-[#20D6C2]">${formatNumber(b.totalAmount)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={async () => {
                            await updateBookingStatus(b.id, "completed");
                            if (currentUser) setBookings(await getBookingsForUser(currentUser.id));
                          }}
                          className="text-xs py-1.5 px-3"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {isNepali ? "सम्पन्न चिन्ह लगाउनुहोस्" : "Mark Completed"}
                        </Button>
                      )}
                      {b.status === "requested" && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={async () => {
                            await updateBookingStatus(b.id, "cancelled");
                            if (currentUser) setBookings(await getBookingsForUser(currentUser.id));
                          }}
                          className="text-xs py-1.5 px-3"
                        >
                          {isNepali ? "रद्द गर्नुहोस्" : "Cancel"}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}


        {/* =========================================================================
            TAB 3: CAREGIVER WORKSPACE (For Registered Professional Caregivers)
           ========================================================================= */}
        {viewTab === "workspace" && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface-elevated)] border border-[#20D6C2]/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#20D6C2]">
                    Professional Portal
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-[var(--text)]">
                    Caregiver Management Dashboard
                  </h2>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    View active patient check-in assignments, record dose compliance, and submit daily visit logs.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-right">
                    <span className="block text-[10px] uppercase text-[var(--text-muted)]">Weekly Earnings</span>
                    <span className="font-mono text-lg font-bold text-[#20D6C2]">$288.00</span>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-right">
                    <span className="block text-[10px] uppercase text-[var(--text-muted)]">Completed Visits</span>
                    <span className="font-mono text-lg font-bold text-[#16A36A] dark:text-[#A3EAC1]">6 check-ins</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Today's Checklist & Patient Protocols */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    Active Patient Assignments
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] font-mono">Today</span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-[#20D6C2]/30 bg-[#20D6C2]/5 p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-display text-[var(--text)]">Eleanor Vance (74 yrs)</strong>
                      <span className="font-mono text-xs font-bold text-[#20D6C2]">10:30 AM &bull; Call</span>
                    </div>
                    <p className="mt-1 text-[var(--text-secondary)]">
                      Dose Protocol: Check Atorvastatin 20mg &amp; Metformin 500mg with breakfast.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="primary" className="text-xs py-1 px-3">
                        <Phone className="h-3.5 w-3.5" /> Call Patient
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          alert("Patient response logged: Dose confirmed taken on time with water.");
                        }}
                        className="text-xs py-1 px-3"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Taken
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-display text-[var(--text)]">Robert Jenkins (82 yrs)</strong>
                      <span className="font-mono text-xs text-[var(--text-muted)]">02:00 PM &bull; Visit</span>
                    </div>
                    <p className="mt-1 text-[var(--text-secondary)]">
                      Visit Protocol: In-person pillbox refill &amp; blood pressure measurement.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Safety & Caregiver Rules */}
              <Card className="p-6 border-[#20D6C2]/20">
                <h3 className="font-display text-base font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#20D6C2]" />
                  <span>Clinical Care Safety Policy</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#20D6C2] font-bold">&bull;</span>
                    <span>Caregivers must never alter prescription dosages or prescribe medications independently.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#20D6C2] font-bold">&bull;</span>
                    <span>Always ask the patient politely whether the prescribed medicine was taken before recording confirmation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#20D6C2] font-bold">&bull;</span>
                    <span>Unconfirmed or missed doses automatically notify consented family members after the grace period.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* =========================================================================
            BOOKING MODAL
           ========================================================================= */}
        {bookingTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md">
            <Card className="w-full max-w-lg p-5 sm:p-6 bg-[var(--surface)] border border-[#20D6C2]/40 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setBookingTarget(null)}
                aria-label="Close dialog"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 pr-10">
                <button
                  type="button"
                  onClick={() => setBookingTarget(null)}
                  aria-label={isNepali ? "फर्कनुहोस्" : "Go back"}
                  title={isNepali ? "फर्कनुहोस्" : "Go back"}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[#16A36A] dark:text-[#20C982] hover:border-[#20D6C2] transition-colors active:scale-95 shrink-0"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
                <div className="h-10 w-10 rounded-xl bg-[#16A36A]/20 flex items-center justify-center text-[#20D6C2] shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text)] truncate">
                    {isNepali ? `${bookingTarget.fullName} सँग हेरचाह तालिका बनाउनुहोस्` : `Schedule Care with ${bookingTarget.fullName}`}
                  </h3>
                  <span className="text-xs text-[#20D6C2] font-mono">
                    ${formatNumber(bookingTarget.hourlyRate)}/{t.marketplace.perHour} &bull; {t.marketplace.verifiedBadge}
                  </span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-[#20D6C2] mx-auto animate-bounce" />
                  <h4 className="font-display text-lg font-bold text-[var(--text)]">{t.marketplace.bookingSuccessMsg}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isNepali ? "हेरचाहकर्तालाई सूचित गरिएको छ र उहाँले समय पुष्टि गर्नुहुनेछ।" : "The caregiver has been notified and will confirm your check-in time."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      {isNepali ? "हेरचाह विधि" : "Check-In Method"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "visit", label: t.marketplace.serviceTypeVisit },
                        { id: "call", label: t.marketplace.serviceTypeCall },
                        { id: "checkin", label: t.marketplace.serviceTypeCheckin },
                      ].map((tItem) => (
                        <button
                          key={tItem.id}
                          type="button"
                          onClick={() => setServiceType(tItem.id as any)}
                          className={`p-2 rounded-xl border text-center font-bold transition-all ${
                            serviceType === tItem.id
                              ? "border-[#20D6C2] bg-[#16A36A]/15 text-[#20D6C2]"
                              : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {tItem.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        {t.marketplace.serviceDate}
                      </label>
                      <input
                        type="date"
                        required
                        value={schedDate}
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        {t.marketplace.serviceTime}
                      </label>
                      <input
                        type="time"
                        required
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {serviceType === "visit" ? (
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        {t.marketplace.serviceAddress}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isNepali ? "घरको ठेगाना, टोल, सहर" : "Street Address, Apt, City"}
                        value={serviceAddress}
                        onChange={(e) => setServiceAddress(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        {t.marketplace.contactPhone}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={isNepali ? "९८००००००००" : "(555) 000-0000"}
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      {t.marketplace.careRequirementsLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={careRequirements}
                      onChange={(e) => setCareRequirements(e.target.value)}
                      placeholder={isNepali ? "जस्तै: बिहानको रक्तचाप औषधिको जाँच र खाना खाएको सुनिश्चितता।" : "e.g. Please verify morning blood pressure medication and food intake."}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#20D6C2] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">{isNepali ? "अनुमानित कुल शुल्क:" : "Total Estimated Charge:"}</span>
                    <strong className="font-mono text-base text-[#20D6C2]">${formatNumber(bookingTarget.hourlyRate)}.00</strong>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setBookingTarget(null)}>
                      {t.common.cancel}
                    </Button>
                    <Button type="submit" size="sm" variant="primary">
                      {t.marketplace.confirmBookingBtn}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}


        {/* =========================================================================
            PROFILE DETAILS & REVIEWS MODAL
           ========================================================================= */}
        {profileDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <Card className="w-full max-w-lg p-6 bg-[var(--surface)] border border-[#20D6C2]/40 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setProfileDetail(null)}
                aria-label="Close dialog"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3.5 border-b border-[var(--border)] pb-4 pr-10">
                <button
                  type="button"
                  onClick={() => setProfileDetail(null)}
                  aria-label={isNepali ? "फर्कनुहोस्" : "Go back"}
                  title={isNepali ? "फर्कनुहोस्" : "Go back"}
                  className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[#16A36A] dark:text-[#20C982] hover:border-[#20D6C2] transition-colors active:scale-95 shrink-0"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#16A36A]/20 flex items-center justify-center text-[#20D6C2] font-display font-bold text-xl sm:text-2xl shrink-0">
                  {profileDetail.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text)] truncate">
                      {profileDetail.fullName}
                    </h3>
                    <BadgeCheck className="h-4 w-4 text-[#20D6C2] shrink-0" />
                  </div>
                  <p className="text-xs text-[#16A36A] dark:text-[#A3EAC1] font-semibold truncate">
                    {profileDetail.qualifications}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono mt-1">
                    <span className="flex items-center gap-1 text-[var(--text)] font-bold">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      {profileDetail.rating.toFixed(2)}
                    </span>
                    <span>{profileDetail.serviceLocation}</span>
                    <span>{profileDetail.yearsExperience} yrs exp</span>
                  </div>
                </div>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    About Caregiver
                  </h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {profileDetail.bio}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Languages Spoken
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profileDetail.languages.map((l) => (
                      <span key={l} className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--text)]">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Verified Reviews ({profileReviews.length})
                  </h4>
                  <div className="space-y-2.5">
                    {profileReviews.map((r) => (
                      <div key={r.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <strong className="text-[var(--text)]">{r.reviewerName}</strong>
                          <div className="flex items-center text-amber-400">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-[#20D6C2]">${profileDetail.hourlyRate}/hr</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const target = profileDetail;
                    setProfileDetail(null);
                    setBookingTarget(target);
                  }}
                  className="text-xs font-bold"
                >
                  Book with {profileDetail.fullName.split(" ")[0]}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}
