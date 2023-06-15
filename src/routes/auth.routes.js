import { Router } from "express";
import { sendSignUpOtp } from "../controllers/auth.controller.js";

const router = new Router();

router.post("/signupOtpSend", sendSignUpOtp);

export default router;
