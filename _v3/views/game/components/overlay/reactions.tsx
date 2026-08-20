import { useState, useEffect } from "react";
import styles from "./overlay.module.scss";
import classNames from "classnames";
import useGameServerContext from "@/hooks/context/use-game-server";
import GAME from "shared/lib/const/game";
import type { LobbyEndAnnouncement } from "shared/types/game";

const center = 100;
const radius = 90;
const innerRadius = 44;
const gapSize = 2;
const extendedRadius = 1000;

const polarToCartesian = (r: number, angleDeg: number) => {
  const angleRad = (Math.PI / 180) * angleDeg;
  return [center + r * Math.cos(angleRad), center + r * Math.sin(angleRad)];
};

const EmojiWheel = () => {
  const [disabled, setDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const { webSocket } = useGameServerContext();

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 2 || disabled) {
        return;
      }

      setVisible(true);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button !== 2 || disabled) {
        return;
      }

      setVisible(false);

      if (selected !== null) {
        webSocket?.sendMessage("playerReaction", {
          reactionIndex: selected,
        });
      }
    };

    const unsubscribe = webSocket?.subscribe<LobbyEndAnnouncement>(
      "gameEnded",
      () => {
        setDisabled(true);
      }
    );

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);

      unsubscribe?.();
    };
  }, [webSocket, selected, disabled]);

  const classes = classNames(styles.overlay__reactions, {
    [styles.visible]: visible,
  });

  if (disabled) {
    return null;
  }

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className={classes}
      style={{ overflow: "visible" }}
    >
      {GAME.REACTION_LIST.map((emoji, i) => {
        // Calculate the segment angle without gaps first
        const segmentAngle = 360 / GAME.REACTION_LIST.length;

        // Calculate the base angles for this segment
        const baseStartAngle = segmentAngle * i - 90;
        const baseEndAngle = baseStartAngle + segmentAngle;

        // Calculate the half angle to create the gap
        const outerGapAngleDeg =
          Math.atan2(gapSize / 2, radius) * (180 / Math.PI);
        const innerGapAngleDeg =
          Math.atan2(gapSize / 2, innerRadius) * (180 / Math.PI);

        // Apply the gap to the start and end angles
        const outerStartAngle = baseStartAngle + outerGapAngleDeg;
        const outerEndAngle = baseEndAngle - outerGapAngleDeg;
        const innerStartAngle = baseStartAngle + innerGapAngleDeg;
        const innerEndAngle = baseEndAngle - innerGapAngleDeg;

        // Calculate the points for the path
        const [x1, y1] = polarToCartesian(radius, outerStartAngle);
        const [x2, y2] = polarToCartesian(radius, outerEndAngle);
        const [x3, y3] = polarToCartesian(innerRadius, innerEndAngle);
        const [x4, y4] = polarToCartesian(innerRadius, innerStartAngle);

        // Create the path with consistent gaps
        const pathData = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 0 1 ${x2} ${y2}
          L ${x3} ${y3}
          A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}
          Z
        `;

        const [labelX, labelY] = polarToCartesian(
          (radius + innerRadius) / 2,
          (outerStartAngle + outerEndAngle) / 2
        );

        // Create the extended invisible segment for better selection
        // We'll use the base angles (without gaps) for the extended segments

        // Create a triangle from center to extended radius
        const invisiblePathData = `
          M ${center} ${center}
          L ${
            center + extendedRadius * Math.cos((Math.PI / 180) * baseStartAngle)
          } ${
          center + extendedRadius * Math.sin((Math.PI / 180) * baseStartAngle)
        }
          A ${extendedRadius} ${extendedRadius} 0 0 1 ${
          center + extendedRadius * Math.cos((Math.PI / 180) * baseEndAngle)
        } ${center + extendedRadius * Math.sin((Math.PI / 180) * baseEndAngle)}
          Z
        `;

        return (
          <g key={i} className={styles.overlay__reactions__segment}>
            {/* Visible segment with styling */}
            <path
              d={pathData}
              fill={selected === i ? "rgba(0,0,0, 0.6)" : "rgba(0, 0, 0, 0.3)"}
              pointerEvents="none"
            />

            {/* Invisible extended segment for interaction */}
            <path
              d={invisiblePathData}
              fill="transparent"
              onMouseOver={() => setSelected(i)}
              onMouseOut={() => setSelected(null)}
              style={{ cursor: "pointer" }}
            />

            <text
              x={labelX}
              y={labelY}
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              style={{ pointerEvents: "none" }}
            >
              {emoji}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default EmojiWheel;
