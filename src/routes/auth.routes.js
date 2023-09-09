import { Router } from "express";
import {
  forgotPassword,
  getProfile,
  listAllUser,
  login,
  logout,
  resetPassword,
  sendSignUpOtp,
  signup,
} from "../controllers/auth.controller.js";
import { authorize, isLoggedIn } from "../middleware/auth.middlerware.js";

const router = new Router();

router.post("/signupOtpSend", sendSignUpOtp);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", isLoggedIn, getProfile);
router.post("/password/forgot", isLoggedIn, forgotPassword);
router.post("/password/reset/:token", isLoggedIn, resetPassword);

router.get("/listAllUser", isLoggedIn, authorize("ADMIN"), listAllUser);
export default router;
