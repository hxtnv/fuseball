const addLeadingZeros = (number: number, shouldProcess: boolean) => {
  if (!shouldProcess) return number.toString();

  return number < 10 ? `0${number}` : number;
};

const secondsToMinutesAndSeconds = (
  seconds: number = 0,
  shouldAddLeadingZeros = true
) => {
  if (isNaN(seconds)) {
    seconds = 0;
  }

  const minutes = addLeadingZeros(
    Math.floor(seconds / 60),
    shouldAddLeadingZeros
  );
  const secondsLeft = addLeadingZeros(seconds % 60, shouldAddLeadingZeros);

  return { minutes, seconds: secondsLeft };
};

export default secondsToMinutesAndSeconds;
