import express from "express";
import {
  signUp,
  logIn,
  verifyEmail,
  LogOut,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middelware/verifyToken.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/verify-email", verifyEmail);
router.get("/check-auth", verifyToken, checkAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/log-in", logIn);
router.post("/log-out", LogOut);
export default router;
