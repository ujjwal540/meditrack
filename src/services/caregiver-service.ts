import type { CaregiverConnection, ConsentStatus } from "@/types";
import { supabase } from "@/lib/supabase";
import { readJSON, uid, writeJSON } from "@/lib/utils";

const KEY = "meditrack.caregivers";

type ConnectionRow = {
  id: string;
  patient_id: string;
  caregiver_id: string | null;
  caregiver_email: string;
  consent_status: ConsentStatus;
  created_at: string;
  caregiver_name?: string | null;
};

function fromRow(row: ConnectionRow): CaregiverConnection {
  return {
    id: row.id,
    patientId: row.patient_id,
    caregiverId: row.caregiver_id ?? undefined,
    caregiverEmail: row.caregiver_email,
    caregiverName: row.caregiver_name ?? undefined,
    consentStatus: row.consent_status,
    createdAt: row.created_at,
  };
}

export async function getConnections(): Promise<CaregiverConnection[]> {
  if (!supabase) return readJSON<CaregiverConnection[]>(KEY, []);
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(`Could not load your account: ${sessionError.message}`);
  if (!sessionData.session) return [];
  const { data, error } = await supabase
    .from("caregiver_connections")
    .select("id, patient_id, caregiver_id, caregiver_email, consent_status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load family connections: ${error.message}`);
  return (data as ConnectionRow[]).map(fromRow);
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not load your account: ${error.message}`);
  return data.user?.id ?? null;
}

export async function inviteCaregiver(email: string, name?: string): Promise<CaregiverConnection> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!supabase) {
    const connection: CaregiverConnection = {
      id: uid(),
      caregiverEmail: normalizedEmail,
      caregiverName: name?.trim() || undefined,
      consentStatus: "invited",
      createdAt: new Date().toISOString(),
    };
    writeJSON(KEY, [...readJSON<CaregiverConnection[]>(KEY, []), connection]);
    return connection;
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You must be signed in to invite a family member.");
  const { data, error } = await supabase
    .from("caregiver_connections")
    .insert({
      patient_id: userData.user.id,
      caregiver_email: normalizedEmail,
      caregiver_name: name?.trim() || null,
    })
    .select("id, patient_id, caregiver_id, caregiver_email, consent_status, created_at, caregiver_name")
    .single();
  if (error) throw new Error(`Could not send family invitation: ${error.message}`);
  return fromRow(data as ConnectionRow);
}

export async function setConsent(id: string, consentStatus: ConsentStatus): Promise<void> {
  if (!supabase) {
    writeJSON(KEY, readJSON<CaregiverConnection[]>(KEY, []).map((c) => (c.id === id ? { ...c, consentStatus } : c)));
    return;
  }
  const { error } = await supabase.from("caregiver_connections").update({ consent_status: consentStatus }).eq("id", id);
  if (error) throw new Error(`Could not update family permissions: ${error.message}`);
}

export async function acceptInvitation(id: string): Promise<void> {
  if (!supabase) {
    await setConsent(id, "accepted");
    return;
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You must be signed in to accept an invitation.");
  const { error } = await supabase
    .from("caregiver_connections")
    .update({ caregiver_id: userData.user.id, consent_status: "accepted" })
    .eq("id", id);
  if (error) throw new Error(`Could not accept family invitation: ${error.message}`);
}

export async function removeConnection(id: string): Promise<void> {
  if (!supabase) {
    writeJSON(KEY, readJSON<CaregiverConnection[]>(KEY, []).filter((c) => c.id !== id));
    return;
  }
  const { error } = await supabase.from("caregiver_connections").delete().eq("id", id);
  if (error) throw new Error(`Could not remove family connection: ${error.message}`);
}
