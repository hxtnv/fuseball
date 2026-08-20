import MAP from "../const/map";

const getInitialBallPosition = () => {
  return {
    x: MAP.FIELD_WIDTH / 2,
    y: MAP.FIELD_HEIGHT / 2,
  };
};

export default getInitialBallPosition;
