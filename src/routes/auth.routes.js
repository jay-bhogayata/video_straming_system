import { Router } from "express";
import {
  cancelSubscription,
  deleteAccount,
  forgotPassword,
  getAllPayment,
  getAllUser,
  getProfile,
  listAllUser,
  login,
  logout,
  resetPassword,
  sendSignUpOtp,
  signup,
  updateClient,
  updateUserInfo,
  updateUserName,
} from "../controllers/auth.controller.js";
import {
  authorize,
  isLoggedIn,
  isSubscriber,
} from "../middleware/auth.middlerware.js";

const router = new Router();

router.get("/getAllUser", isLoggedIn, authorize("ADMIN"), getAllUser);
router.get("/getAllPayment", isLoggedIn, authorize("ADMIN"), getAllPayment);
router.post("/signupOtpSend", sendSignUpOtp);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", isLoggedIn, getProfile);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.post("/updateClient", isLoggedIn, updateClient);
router.post(
  "/cancelSubscription",
  isLoggedIn,
  isSubscriber,
  cancelSubscription
);
router.post("/cancelAdminSubscription", isLoggedIn, cancelSubscription);
router.get("/listAllUser", isLoggedIn, authorize("ADMIN"), listAllUser);
router.post("/updateUserName", isLoggedIn, updateUserName);
router.delete("/deleteAccount", isLoggedIn, deleteAccount);
router.post("/updateUserInfo", isLoggedIn, authorize("ADMIN"), updateUserInfo);
export default router;
