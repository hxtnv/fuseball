const getInitialPosition = (index: number) => {
  const x = Math.random() * 1000;
  const y = Math.random() * 500;

  return {
    x,
    y,
  };
};

export default getInitialPosition;
