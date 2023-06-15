import { Router } from "express";
import {
  getProfile,
  login,
  logout,
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

export default router;
