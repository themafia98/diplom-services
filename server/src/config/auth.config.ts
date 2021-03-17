export default Object.freeze({
  SECRET: process.env.JWT_SECRET as string,
  USER_PROPERTY: 'payload',
});
