// components/AnalogClock.tsx

import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import type { DayPrayers, PrayerName } from "../lib/prayer-time";

interface AnalogClockProps {
  prayers: DayPrayers;
  nextPrayer: PrayerName;
}

const PRAYER_COLORS: Record<PrayerName, string> = {
  fajr: "#4a7c59",
  dhuhr: "#c4a35a",
  asr: "#d4a574",
  maghrib: "#8b5a5a",
  isha: "#5a6a8b",
};

export function AnalogClock({ prayers, nextPrayer }: AnalogClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const prayerOrder: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  // Ángulo de cada segmento (72º para 5 rezos)
  const getSegmentAngle = (index: number) => {
    return index * 72 - 90; // empezamos en la parte superior
  };

  // Ángulo de la aguja de horas
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const hourAngle =
    ((hours % 12) / 12) * 360 + (minutes / 60) * 30 - 90;

  // Path SVG de cada segmento
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const cx = 150;
    const cy = 150;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <View className="w-full max-w-[320px] self-center">
      <Svg
        viewBox="0 0 300 300"
        style={{ width: "100%", height: undefined, aspectRatio: 1 }}
      >
        {/* Círculo de fondo */}
        <Circle
          cx={150}
          cy={150}
          r={140}
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth={3}
        />

        {/* Segmentos de cada oración */}
        {prayerOrder.map((prayer, index) => {
          const startAngle = getSegmentAngle(index);
          const endAngle = getSegmentAngle(index + 1);
          const isNext = prayer === nextPrayer;

          return (
            <Path
              key={prayer}
              d={createArc(startAngle, endAngle, 130)}
              fill={PRAYER_COLORS[prayer]}
              opacity={isNext ? 1 : 0.25}
            />
          );
        })}

        {/* Círculo interior (efecto donut) */}
        <Circle cx={150} cy={150} r={70} fill="#ffffff" />

        {/* Punto central */}
        <Circle cx={150} cy={150} r={8} fill="#020617" />

        {/* Aguja de hora */}
        <Line
          x1={150}
          y1={150}
          x2={150 + 55 * Math.cos((hourAngle * Math.PI) / 180)}
          y2={150 + 55 * Math.sin((hourAngle * Math.PI) / 180)}
          stroke="#020617"
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Etiquetas alrededor del reloj */}
        {prayerOrder.map((prayer, index) => {
          const angle = getSegmentAngle(index) + 36; // centro del segmento
          const rad = (angle * Math.PI) / 180;
          const x = 150 + 105 * Math.cos(rad);
          const y = 150 + 105 * Math.sin(rad);
          const isNext = prayer === nextPrayer;

          return (
            <SvgText
              key={`label-${prayer}`}
              x={x}
              y={y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={10}
              fontWeight="700"
              fill={isNext ? "#020617" : "#6b7280"}
            >
              {prayer.charAt(0).toUpperCase()}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
