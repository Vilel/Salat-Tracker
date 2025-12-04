// lib/prayer-times.ts

// Nombres de las oraciones
export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

// Estructura de una oración concreta
export interface PrayerTime {
  name: PrayerName;
  time: Date;
  hour: number;
  minute: number;
}

// Estructura de todas las oraciones del día
export interface DayPrayers {
  fajr: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
}

// Orden estándar de las oraciones (por si quieres reutilizarlo en otros sitios)
export const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

// Datos de localización (te servirán junto con expo-location)
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Tipos internos para la respuesta de la API de Aladhan
interface AladhanTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: AladhanTimings;
    date: {
      readable: string;
      hijri: {
        date: string;
        month: { en: string; ar: string };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

// Llama a la API de Aladhan y devuelve los horarios como DayPrayers
export async function fetchPrayerTimesFromAPI(
  latitude: number,
  longitude: number
): Promise<DayPrayers> {
  const today = new Date();
  const timestamp = Math.floor(today.getTime() / 1000);

  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }

  const data: AladhanResponse = await response.json();

  if (data.code !== 200) {
    throw new Error("Invalid response from Aladhan API");
  }

  const timings = data.data.timings;

  const parseTime = (timeStr: string, name: PrayerName): PrayerTime => {
    // Algunas respuestas vienen con "03:45 (CEST)" → nos quedamos con la parte HH:MM
    const cleanTime = timeStr.split(" ")[0];
    const [hour, minute] = cleanTime.split(":").map(Number);

    const time = new Date(today);
    time.setHours(hour, minute, 0, 0);

    return { name, time, hour, minute };
  };

  return {
    fajr: parseTime(timings.Fajr, "fajr"),
    dhuhr: parseTime(timings.Dhuhr, "dhuhr"),
    asr: parseTime(timings.Asr, "asr"),
    maghrib: parseTime(timings.Maghrib, "maghrib"),
    isha: parseTime(timings.Isha, "isha"),
  };
}

// Localización por defecto (Mecca) si no hay permisos o no se puede obtener la posición
export function getDefaultLocation(): LocationData {
  return {
    latitude: 21.4225,
    longitude: 39.8262,
    city: "Mecca",
    country: "Saudi Arabia",
  };
}

// Devuelve la próxima oración a partir de los horarios del día
export function getNextPrayer(prayers: DayPrayers): PrayerTime | null {
  const now = new Date();
  const order: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  for (const name of order) {
    if (prayers[name].time > now) {
      return prayers[name];
    }
  }

  // Si ya han pasado todas, devolvemos el fajr del “día siguiente”
  const tomorrowFajr = new Date(prayers.fajr.time);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

  return {
    ...prayers.fajr,
    time: tomorrowFajr,
  };
}

// Diferencia entre ahora y la oración (para mostrar contador)
export function getTimeUntilPrayer(prayer: PrayerTime): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const diff = prayer.time.getTime() - now.getTime();

  if (diff < 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diff % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

// Formatea la hora HH:MM con leading zeros
export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}
