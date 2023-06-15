import { Router } from "express";
import {
  login,
  logout,
  sendSignUpOtp,
  signup,
} from "../controllers/auth.controller.js";

const router = new Router();

router.post("/signupOtpSend", sendSignUpOtp);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
