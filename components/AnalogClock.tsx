// components/AnalogClock.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Text as SvgText,
} from "react-native-svg";

import {
  ClockTheme,
  Colors,
  FontSizes,
  PrayerStripeColors,
  type ColorSchemeName,
} from "@/constants/theme";
import type {
  DayPrayers,
  PrayerName,
  PrayerTime,
} from "@/lib/prayer-times";

// --- Constantes de diseño ---
const CLOCK_SIZE = 320;
const CENTER = CLOCK_SIZE / 2;

// Radios
const R_BEZEL = CLOCK_SIZE / 2;      // radio máximo del reloj
const R_ARC_OUTER = R_BEZEL;         // las franjas llegan hasta el borde
const R_ARC_INNER = R_BEZEL - 18;    // grosor del anillo de franjas
const R_FACE = R_ARC_INNER;          // cara interior del reloj
const R_TICKS = R_FACE - 6;
const R_NUMBERS = R_TICKS - 12;      // números 00–23
const R_ICON_RADIUS = R_FACE * 0.5;  // sol / luna

// Orden fijo de los rezos
const PRAYER_KEYS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

interface AnalogClockProps {
  prayers: DayPrayers;
  nextPrayer: PrayerName; // se mantiene por API aunque no lo usemos visualmente
}

// --- Helpers matemáticos ---

// 24 h: 0–23 -> 360º (15º por hora), 0h arriba.
const timeToDegrees24 = (hour: number, minute: number): number => {
  const h = hour + minute / 60;
  return h * 15; // 360 / 24
};

const prayerTimeToDegrees24 = (prayer: PrayerTime | undefined): number => {
  if (!prayer) return 0;
  return timeToDegrees24(prayer.hour, prayer.minute);
};

const polarToCartesian = (radius: number, angleDeg: number) => {
  // 0º en la parte superior, sentido horario
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
};

// Sector lleno entre startDeg y endDeg (puede cruzar medianoche)
const createSectorPath = (
  startDeg: number,
  endDeg: number,
  radius: number
) => {
  let s = startDeg;
  let e = endDeg;

  if (e <= s) e += 360;

  const largeArc = e - s > 180 ? 1 : 0;

  const start = polarToCartesian(radius, s);
  const end = polarToCartesian(radius, e);

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

// Arco anillo entre startDeg y endDeg (para franjas de salat)
const createRingArcPath = (
  startDeg: number,
  endDeg: number,
  innerR: number,
  outerR: number
): string => {
  let s = startDeg;
  let e = endDeg;

  if (e <= s) e += 360;

  const largeArc = e - s > 180 ? 1 : 0;

  const outerStart = polarToCartesian(outerR, s);
  const outerEnd = polarToCartesian(outerR, e);
  const innerStart = polarToCartesian(innerR, s);
  const innerEnd = polarToCartesian(innerR, e);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};

// ángulo medio entre dos ángulos, respetando wrap 360
const midAngle = (startDeg: number, endDeg: number): number => {
  let s = startDeg;
  let e = endDeg;
  if (e <= s) e += 360;
  return (s + e) / 2;
};

export function AnalogClock({ prayers }: AnalogClockProps) {
  const [now, setNow] = useState(new Date());

  // Tema actual (light / dark) según el sistema
  const scheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    scheme === "dark" ? "dark" : "light";

  const clockColors = ClockTheme[colorScheme];
  const textColor = Colors[colorScheme].text;

  // Animación para sol y luna
  const sunAnim = useRef(new Animated.Value(0)).current;
  const moonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (val: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          } as Animated.TimingAnimationConfig),
          Animated.timing(val, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          } as Animated.TimingAnimationConfig),
        ])
      );

    makeLoop(sunAnim).start();
    makeLoop(moonAnim).start();
  }, [sunAnim, moonAnim]);

  // Tick cada segundo
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  // Agujas (24 h para la hora)
  const hourDeg = timeToDegrees24(hours, minutes);
  const minuteDeg = minutes * 6 + seconds * 0.1;

  // 1) Día / noche dinámicos a partir de Fajr–Maghrib
  const { nightSectorPath, sunDeg, moonDeg } = useMemo(() => {
    const fajr = prayers.fajr;
    const maghrib = prayers.maghrib;

    let dayStartDeg: number;
    let dayEndDeg: number;

    if (fajr && maghrib) {
      dayStartDeg = prayerTimeToDegrees24(fajr);
      dayEndDeg = prayerTimeToDegrees24(maghrib);
    } else {
      // Fallback: día 06–18 si faltan datos
      dayStartDeg = 6 * 15;
      dayEndDeg = 18 * 15;
    }

    // noche = sector complementario sobre la cara del reloj (solo interior)
    const nightSector = createSectorPath(dayEndDeg, dayStartDeg, R_FACE);

    // sol en el centro del arco de día
    const sunAngle = midAngle(dayStartDeg, dayEndDeg);
    // luna en el centro del arco de noche
    const moonAngle = midAngle(dayEndDeg, dayStartDeg);

    return {
      nightSectorPath: nightSector,
      sunDeg: sunAngle,
      moonDeg: moonAngle,
    };
  }, [prayers]);

  // 2) Franjas de cada rezo (anillo exterior ocupando el “bisel”)
  const prayerArcs = useMemo(() => {
    const arcs: React.ReactNode[] = [];
    const palette = PrayerStripeColors[colorScheme];

    const sequence = PRAYER_KEYS;
    for (let i = 0; i < sequence.length; i++) {
      const currentName = sequence[i];
      const nextName = sequence[(i + 1) % sequence.length];

      const current = prayers[currentName];
      const next = prayers[nextName];

      if (!current || !next) continue;

      const startDeg = prayerTimeToDegrees24(current);
      const endDeg = prayerTimeToDegrees24(next);
      const color = palette[currentName];

      const d = createRingArcPath(
        startDeg,
        endDeg,
        R_ARC_INNER,
        R_ARC_OUTER
      );

      arcs.push(<Path key={`arc-${currentName}`} d={d} fill={color} />);
    }

    return arcs;
  }, [prayers, colorScheme]);

  // 3) Números 00–23
  const hourNumbers = useMemo(() => {
    const texts: React.ReactNode[] = [];
    for (let h = 0; h < 24; h++) {
      const angle = h * 15;
      const pos = polarToCartesian(R_NUMBERS, angle);
      const label = h.toString().padStart(2, "0");

      texts.push(
        <SvgText
          key={`num-${h}`}
          x={pos.x}
          y={pos.y + 4}
          fontSize={FontSizes.xxs}
          fill={textColor}
          textAnchor="middle"
        >
          {label}
        </SvgText>
      );
    }
    return texts;
  }, [textColor]);

  // 4) Posiciones de sol y luna
  const sunPos = polarToCartesian(R_ICON_RADIUS, sunDeg);
  const moonPos = polarToCartesian(R_ICON_RADIUS, moonDeg);
  const iconSize = 40;

  const sunStyle = {
    transform: [
      {
        translateY: sunAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-4, 4],
        }),
      },
      {
        scale: sunAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.05],
        }),
      },
    ],
  };

  const moonStyle = {
    transform: [
      {
        translateY: moonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [4, -4],
        }),
      },
      {
        scale: moonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.05],
        }),
      },
    ],
  };

  return (
    <View className="w-full items-center py-4">
      <View
        className="relative"
        style={[
          styles.clockWrapper,
          styles.shadow,
          { shadowColor: clockColors.shadow },
        ]}
      >
        {/* SVG de fondo: cara, franjas, noche y números */}
        <Svg
          width={CLOCK_SIZE}
          height={CLOCK_SIZE}
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
        >
          {/* Cara interior */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R_FACE}
            fill={clockColors.faceBg}
          />

          {/* Franjas de cada rezo ocupando el “bisel” exterior */}
          {prayerArcs}

          {/* Sector de noche (oscurece solo la parte interior) */}
          <Path d={nightSectorPath} fill={clockColors.nightOverlay} />

          {/* Números 00–23 */}
          {hourNumbers}
        </Svg>

        {/* Sol */}
        <Animated.View
          className="absolute"
          style={[
            styles.icon,
            sunStyle,
            {
              left: sunPos.x - iconSize / 2,
              top: sunPos.y - iconSize / 2,
            },
          ]}
        >
          <Ionicons name="sunny" size={iconSize} color={clockColors.sun} />
        </Animated.View>

        {/* Luna */}
        <Animated.View
          className="absolute"
          style={[
            styles.icon,
            moonStyle,
            {
              left: moonPos.x - iconSize / 2,
              top: moonPos.y - iconSize / 2,
            },
          ]}
        >
          <Ionicons name="moon" size={iconSize} color={clockColors.moon} />
        </Animated.View>

        {/* Agujas y pivote central */}
        <Svg
          width={CLOCK_SIZE}
          height={CLOCK_SIZE}
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
          style={StyleSheet.absoluteFill}
        >
          {/* Aguja de hora (24h) */}
          <G transform={`rotate(${hourDeg}, ${CENTER}, ${CENTER})`}>
            <Line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - R_FACE * 0.6}
              stroke={clockColors.hourHand}
              strokeWidth={4}
              strokeLinecap="round"
            />
          </G>

          {/* Aguja de minutos */}
          <G transform={`rotate(${minuteDeg}, ${CENTER}, ${CENTER})`}>
            <Line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - R_FACE * 0.85}
              stroke={clockColors.minuteHand}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </G>

          {/* Pivote central */}
          <Circle cx={CENTER} cy={CENTER} r={7} fill={clockColors.center} />
          <Circle cx={CENTER} cy={CENTER} r={3} fill="#ffffff" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clockWrapper: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: "transparent",
    position: "relative",
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  icon: {
    position: "absolute",
  },
});
