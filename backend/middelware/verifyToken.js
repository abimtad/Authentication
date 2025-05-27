import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorHandler.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return next(errorHandler(401, "Unauthorized - No token provided!"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return next(
        errorHandler(401, "Unauthorized - Invalid or expired token!")
      );
    req.userId = decoded.userId;
    next();
  });
};
