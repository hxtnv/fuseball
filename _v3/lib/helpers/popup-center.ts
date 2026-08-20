const popupCenter = () => {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;
  const width =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

  const height =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    screen.height;

  const systemZoom = width / window.screen.availWidth;

  const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
  const top = (height - 800) / 2 / systemZoom + dualScreenTop;

  return `width=${500 / systemZoom},height=${
    800 / systemZoom
  },top=${top},left=${left}`;
};

export default popupCenter;
