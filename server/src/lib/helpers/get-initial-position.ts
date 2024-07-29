import MAP from "../const/map";

const POSITIONS = [
  { x: (MAP.FIELD_WIDTH / 2) * 0.7, y: MAP.FIELD_HEIGHT * 0.4 }, // top front
  { x: (MAP.FIELD_WIDTH / 2) * 0.7, y: MAP.FIELD_HEIGHT * 0.6 }, // bottom front
  { x: (MAP.FIELD_WIDTH / 2) * 0.45, y: MAP.FIELD_HEIGHT * 0.2 }, // top back
  { x: (MAP.FIELD_WIDTH / 2) * 0.45, y: MAP.FIELD_HEIGHT * 0.8 }, // bottom back
];

const getInitialPosition = (index: number, team: number) => {
  if (!POSITIONS[index]) {
    return { x: 0, y: 0 };
  }

  const x = POSITIONS[index].x;
  const y = POSITIONS[index].y;

  return {
    x: team === 1 ? MAP.FIELD_WIDTH - x : x,
    y,
  };
};

export default getInitialPosition;
