const addLeadingZeros = (number: number, shouldProcess: boolean) => {
  if (!shouldProcess) return number.toString();

  return number < 10 ? `0${number}` : number;
};

const secondsToMinutesAndSeconds = (
  seconds: number,
  shouldAddLeadingZeros = true
) => {
  const minutes = addLeadingZeros(
    Math.floor(seconds / 60),
    shouldAddLeadingZeros
  );
  const secondsLeft = addLeadingZeros(seconds % 60, shouldAddLeadingZeros);

  return { minutes, seconds: secondsLeft };
};

export default secondsToMinutesAndSeconds;
