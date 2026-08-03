import { motion } from "framer-motion";
import { EASE } from "../../lib/motion";

interface ProgressRingProps {
  value: number;
  label?: string;
  size?: number;
  stroke?: number;
}

export default function ProgressRing({ value, label, size = 96, stroke = 7 }: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="progress-wrap">
      <div style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ring-grad)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6c7cff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <span
          className="progress-ring-value"
          style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 16 }}
        >
          {Math.round(clamped)}%
        </span>
      </div>
      {label && <span className="progress-ring-label">{label}</span>}
    </div>
  );
}
