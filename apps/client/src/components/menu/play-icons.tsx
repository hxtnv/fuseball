// Chunky, filled game icons for the play buttons (lucide is too flat here).
interface IconProps {
  size?: number;
}

export const BallIcon = ({ size = 40 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle
      cx="32"
      cy="32"
      r="26"
      fill="#fff"
      stroke="#12321f"
      stroke-width="4"
    />
    <path d="M32 16l12 9-5 14H25l-5-14z" fill="#12321f" />
    <g stroke="#12321f" stroke-width="3.4" stroke-linecap="round">
      <path d="M32 9v7" />
      <path d="M12 24l6.5 4.5" />
      <path d="M52 24l-6.5 4.5" />
      <path d="M20 52l4-6" />
      <path d="M44 52l-4-6" />
    </g>
  </svg>
);

export const FlameIcon = ({ size = 34 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path
      d="M34 5c3 10 15 14 15 28a17 17 0 0 1-34 0c0-7 4-12 7-15 0 6 3 9 6 9-6-10 2-21 6-22z"
      fill="#fff"
    />
    <path
      d="M33 28c2 4 7 7 7 14a8 8 0 0 1-16 0c0-4 3-7 5-9 0 3 2 4 3 4-2-4 0-7 1-9z"
      fill="#ffb020"
    />
  </svg>
);

export const PartyIcon = ({ size = 34 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="#fff">
    <circle cx="23" cy="20" r="9" />
    <circle cx="44" cy="23" r="7" />
    <path d="M7 53c0-10 7-17 16-17s16 7 16 17z" />
    <path d="M41 53c0-8 5-14 11-14s10 6 10 14z" />
  </svg>
);

export const ArrowIcon = ({ size = 26 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5l11 7-11 7z" />
  </svg>
);
