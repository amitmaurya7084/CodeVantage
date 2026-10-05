// Centralized error handler — every controller should call next(err) on failure
// instead of leaking raw stack traces to the client.

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/** Converts known Mongoose/Mongo/Multer error shapes into friendly 400s instead of raw 500s. */
function normalizeError(err) {
  if (err.name === "CastError") {
    return { statusCode: 400, message: "Invalid ID format." };
  }
  if (err.name === "ValidationError") {
    const firstMessage = Object.values(err.errors)[0]?.message;
    return { statusCode: 400, message: firstMessage || "Invalid input." };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return { statusCode: 409, message: `This ${field} is already in use.` };
  }
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large (25MB max)." : "File upload failed. Please try again.";
    return { statusCode: 400, message };
  }
  return { statusCode: err.statusCode || 500, message: err.publicMessage || err.message };
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // If a response has already started (e.g. an error after res.json()), we can't
  // send another one — hand over to Express's default handler, which closes the connection.
  if (res.headersSent) return next(err);

  const { statusCode, message } = normalizeError(err);

  // Log full detail server-side only
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: message || "Something went wrong. Please try again.",
  });
}

module.exports = { notFound, errorHandler };
