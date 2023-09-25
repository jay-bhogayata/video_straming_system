import { Router } from "express";
import {
  addMovie,
  transcode,
  uploadVideo,
  getMovie,
  getMovieById,
  deleteMovieById,
  thumbImgUpload,
  updateMovieById,
  userGetMovieById,
  getMovieAdmin,
  addRating,
} from "../controllers/video.controller.js";
import {
  authorize,
  isLoggedIn,
  isSubscriber,
} from "../middleware/auth.middlerware.js";

const router = new Router();

router.get("/userGetMovieById/:id", userGetMovieById);
router.get("/getAllMovie", isLoggedIn, isSubscriber, getMovie);
router.get("/getAllMovieAdmin", isLoggedIn, authorize("ADMIN"), getMovieAdmin);
router.post("/rateMovie", isLoggedIn, addRating);
router.post("/addMovie", isLoggedIn, authorize("ADMIN"), addMovie);
router.put(
  "/updateMovieById/:id",
  isLoggedIn,
  authorize("ADMIN"),
  updateMovieById
);
router.post("/upload", isLoggedIn, authorize("ADMIN"), uploadVideo);
router.post("/transcode", transcode);
router.get("/getMovieById/:id", getMovieById);
router.delete(
  "/deleteMovieById/:id",
  isLoggedIn,
  authorize("ADMIN"),
  deleteMovieById
);
router.post("/thumbImgUpload", isLoggedIn, authorize("ADMIN"), thumbImgUpload);

export default router;
