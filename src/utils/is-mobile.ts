export const getIsMobile = () => {
  const userAgent = window.navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  return isMobile;
};
