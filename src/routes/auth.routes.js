import { Router } from "express";
import { sendSignUpOtp, signup } from "../controllers/auth.controller.js";

const router = new Router();

router.post("/signupOtpSend", sendSignUpOtp);
router.post("/signup", signup);

export default router;
