import type { Appointment, HealthMeasurement } from "@/types";
import { readJSON, uid, writeJSON } from "@/lib/utils";

const MEASUREMENTS_KEY = "meditrack.health_measurements";
const APPOINTMENTS_KEY = "meditrack.appointments";

export function getMeasurements(): HealthMeasurement[] {
  return readJSON<HealthMeasurement[]>(MEASUREMENTS_KEY, []);
}

export function addMeasurement(input: Omit<HealthMeasurement, "id">): HealthMeasurement {
  const measurement = { ...input, id: uid() };
  writeJSON(MEASUREMENTS_KEY, [measurement, ...getMeasurements()]);
  return measurement;
}

export function getAppointments(): Appointment[] {
  return readJSON<Appointment[]>(APPOINTMENTS_KEY, []);
}

export function addAppointment(input: Omit<Appointment, "id">): Appointment {
  const appointment = { ...input, id: uid() };
  writeJSON(APPOINTMENTS_KEY, [appointment, ...getAppointments()]);
  return appointment;
}

export function removeAppointment(id: string): void {
  writeJSON(APPOINTMENTS_KEY, getAppointments().filter((appointment) => appointment.id !== id));
}
