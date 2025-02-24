export const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); //Always round-off downwards (100000 + 0.465246 * 900000) = 518,721
};
