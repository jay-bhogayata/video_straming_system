import { Router } from "express";
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  resetPassword,
  sendSignUpOtp,
  signup,
} from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middleware/auth.middlerware.js";

const router = new Router();

router.post("/signupOtpSend", sendSignUpOtp);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", isLoggedIn, getProfile);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);

export default router;
