// components/AnalogClock.tsx

import type {
  DayPrayers,
  PrayerName,
  PrayerTime,
} from "@/lib/prayer-times";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

// --- Constantes de diseño ---
const CLOCK_SIZE = 320;
const CENTER = CLOCK_SIZE / 2;

// Radios para diferentes elementos
const R_BEZEL = CLOCK_SIZE / 2 - 2;
const R_FACE = R_BEZEL - 10;
const R_TICKS = R_FACE - 15;
const R_MARKERS = R_TICKS - 25; // Posición de los círculos de colores de cada oración

// Paleta de colores
const COLORS = {
  bezel: "#64748b", // Marco exterior (slate)
  faceBg: "#f8fafc", // Fondo off-white
  ticksThin: "#94a3b8",
  ticksThick: "#475569",
  hourHand: "#1e293b", // Dark slate
  minuteHand: "#334155",
  secondHand: "#ef4444", // Rojo acento
  centerPivot: "#0f172a",
};

// Colores específicos para cada rezo
const PRAYER_COLORS: Record<PrayerName, string> = {
  fajr: "#0ea5e9", // Amanecer
  dhuhr: "#eab308", // Mediodía
  asr: "#f97316", // Tarde
  maghrib: "#a855f7", // Atardecer
  isha: "#1e40af", // Noche
};

interface AnalogClockProps {
  prayers: DayPrayers;
  nextPrayer: PrayerName;
}

// --- Helpers matemáticos ---

// De un PrayerTime (hora/minuto) a grados en el reloj
const prayerTimeToDegrees = (prayer: PrayerTime | undefined): number => {
  if (!prayer) return 0;
  const { hour, minute } = prayer;
  return (hour % 12) * 30 + minute * 0.5;
};

const polarToCartesian = (radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: CENTER + radius * Math.cos(angleInRadians),
    y: CENTER + radius * Math.sin(angleInRadians),
  };
};

// Orden fijo de los rezos
const PRAYER_KEYS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function AnalogClock({ prayers, nextPrayer }: AnalogClockProps) {
  const [time, setTime] = useState(new Date());

  // Tick cada segundo
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Ángulos de las agujas
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  // 1. Ticks (marcas de minutos / horas)
  const renderTicks = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const isMajor = i % 5 === 0; // cada 5 minutos
      const angle = i * 6;
      const length = isMajor ? 12 : 7;
      const width = isMajor ? 2.5 : 1.5;
      const color = isMajor ? COLORS.ticksThick : COLORS.ticksThin;

      const start = polarToCartesian(R_TICKS, angle);
      const end = polarToCartesian(R_TICKS - length, angle);

      return (
        <Line
          key={i}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
        />
      );
    });
  }, []);

  // 2. Marcadores de rezo (círculos de colores)
  const renderPrayerMarkers = useMemo(() => {
    return PRAYER_KEYS.map((key) => {
      const prayer = prayers[key];
      if (!prayer) return null;

      const degrees = prayerTimeToDegrees(prayer);
      const isNext = key === nextPrayer;
      const color = PRAYER_COLORS[key];

      const pos = polarToCartesian(R_MARKERS, degrees);
      const size = isNext ? 14 : 9;

      return (
        <G key={key} transform={`translate(${pos.x}, ${pos.y})`}>
          {/* Anillo exterior brillante si es el siguiente rezo */}
          {isNext && (
            <Circle
              r={size + 3}
              fill="none"
              stroke="white"
              strokeWidth={3}
              opacity={0.8}
            />
          )}
          {/* Círculo de color principal */}
          <Circle
            r={size}
            fill={color}
            stroke={COLORS.hourHand}
            strokeWidth={1}
            strokeOpacity={0.2}
          />
        </G>
      );
    });
  }, [prayers, nextPrayer]);

  return (
    <View style={styles.container}>
      <View style={[styles.clockWrapper, styles.shadow]}>
        <Svg
          width={CLOCK_SIZE}
          height={CLOCK_SIZE}
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
        >
          <Defs>
            {/* Gradiente sutil para las agujas metálicas */}
            <LinearGradient id="handGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop
                offset="0%"
                stopColor={COLORS.hourHand}
                stopOpacity={0.9}
              />
              <Stop offset="50%" stopColor={COLORS.minuteHand} />
              <Stop
                offset="100%"
                stopColor={COLORS.hourHand}
                stopOpacity={0.9}
              />
            </LinearGradient>
          </Defs>

          {/* CAPA 1: Bisel Exterior */}
          <Circle cx={CENTER} cy={CENTER} r={R_BEZEL} fill={COLORS.bezel} />

          {/* CAPA 2: Cara del Reloj */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_FACE}
            fill={COLORS.faceBg}
            stroke="white"
            strokeWidth={2}
          />

          {/* CAPA 3: Ticks */}
          {renderTicks}

          {/* CAPA 4: Marcadores de Rezo */}
          {renderPrayerMarkers}

          {/* CAPA 5: Agujas */}

          {/* Horas */}
          <G transform={`rotate(${hourDeg}, ${CENTER}, ${CENTER})`}>
            {/* Contrapeso trasero */}
            <Rect
              x={CENTER - 3}
              y={CENTER + 5}
              width={6}
              height={25}
              rx={3}
              fill={COLORS.hourHand}
            />
            {/* Cuerpo principal cónico */}
            <Path
              d={`M ${CENTER - 4} ${CENTER} L ${
                CENTER - 2
              } ${CENTER - R_FACE * 0.6} L ${
                CENTER + 2
              } ${CENTER - R_FACE * 0.6} L ${CENTER + 4} ${CENTER} Z`}
              fill="url(#handGradient)"
            />
          </G>

          {/* Minutos */}
          <G transform={`rotate(${minuteDeg}, ${CENTER}, ${CENTER})`}>
            <Rect
              x={CENTER - 2}
              y={CENTER + 5}
              width={4}
              height={30}
              rx={2}
              fill={COLORS.minuteHand}
            />
            <Path
              d={`M ${CENTER - 3} ${CENTER} L ${
                CENTER - 1.5
              } ${CENTER - R_FACE * 0.85} L ${
                CENTER + 1.5
              } ${CENTER - R_FACE * 0.85} L ${CENTER + 3} ${CENTER} Z`}
              fill="url(#handGradient)"
            />
          </G>

          {/* Segundos */}
          <G transform={`rotate(${secondDeg}, ${CENTER}, ${CENTER})`}>
            {/* Cola */}
            <Line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER + 35}
              stroke={COLORS.secondHand}
              strokeWidth={2}
            />
            <Circle
              cx={CENTER}
              cy={CENTER + 28}
              r={4}
              fill={COLORS.secondHand}
            />
            {/* Cuerpo principal */}
            <Line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - R_FACE * 0.9}
              stroke={COLORS.secondHand}
              strokeWidth={1.5}
            />
            {/* Punto en la punta */}
            <Circle
              cx={CENTER}
              cy={CENTER - R_FACE * 0.9}
              r={2}
              fill={COLORS.secondHand}
            />
          </G>

          {/* CAPA 6: Pivote central */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={8}
            fill={COLORS.centerPivot}
            stroke={COLORS.bezel}
            strokeWidth={2}
          />
          <Circle cx={CENTER} cy={CENTER} r={4} fill={COLORS.secondHand} />
          <Circle cx={CENTER} cy={CENTER} r={2} fill="#ffffff" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  clockWrapper: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: "transparent",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
});
