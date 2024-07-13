export const returnError = (res, err, altMessage = 'Internal Server Error') =>
  res.status(err.status || 500).send(err.message || altMessage);
