import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, _req, res, _next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  return res.status(statusCode).json({
    statusCode,
    data: null,
    message: err?.message || "Internal Server Error",
    success: false,
    errors: Array.isArray(err?.errors) ? err.errors : [],
  });
};

export { errorHandler };
