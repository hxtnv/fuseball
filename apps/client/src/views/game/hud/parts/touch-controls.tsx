import { useRef, useState } from "preact/hooks";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui";
import styles from "./touch-controls.module.scss";

interface TouchControlsProps {
  onMove: (x: number, y: number) => void;
  onKick?: () => void;
}

// on-screen joystick (left) + kick button (right); shown only on coarse pointers
export const TouchControls = ({ onMove, onKick }: TouchControlsProps) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });

  const track = (e: PointerEvent) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const max = rect.width / 2;
    let dx = e.clientX - (rect.left + max);
    let dy = e.clientY - (rect.top + max);
    const dist = Math.hypot(dx, dy);
    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }
    setThumb({ x: dx, y: dy });
    onMove(dx / max, dy / max);
  };

  const start = (e: PointerEvent) => {
    active.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    track(e);
  };
  const move = (e: PointerEvent) => {
    if (active.current) track(e);
  };
  const end = () => {
    if (!active.current) return;
    active.current = false;
    setThumb({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div class={styles.touch}>
      <div
        ref={baseRef}
        class={styles.touch__stick}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <span
          class={styles.touch__stick__thumb}
          style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }}
        />
      </div>

      <Button
        class={styles.touch__kick}
        variant="primary"
        iconSize={34}
        icon={<Zap />}
        title="Kick"
        onClick={onKick}
      />
    </div>
  );
};
