"use client";

interface WaveformLoaderProps {
  bars?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { height: 24, barWidth: 3, gap: 2 },
  md: { height: 40, barWidth: 4, gap: 3 },
  lg: { height: 64, barWidth: 5, gap: 4 },
};

export function WaveformLoader({ bars = 12, color = "#22C55E", size = "md" }: WaveformLoaderProps) {
  const { height, barWidth, gap } = sizeMap[size];

  return (
    <div
      className="flex items-center justify-center"
      style={{ height, gap }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="rounded-full waveform-bar"
          style={{
            width: barWidth,
            height: height * 0.5,
            backgroundColor: color,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
