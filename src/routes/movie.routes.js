import { Router } from "express";
import {
  addMovie,
  transcode,
  uploadVideo,
  getMovie,
  getMovieById,
  deleteMovieById,
  test,
  thumbImgUpload,
  updateMovieById,
} from "../controllers/video.controller.js";
import { authorize, isLoggedIn } from "../middleware/auth.middlerware.js";

const router = new Router();

router.post("/addMovie", isLoggedIn, authorize, addMovie);
router.put("/updateMovieById/:id", isLoggedIn, authorize, updateMovieById);
router.get("/getAllMovie", getMovie);
router.post("/upload", isLoggedIn, authorize, uploadVideo);
router.post("/transcode", isLoggedIn, authorize, transcode);
router.get("/getMovieById/:id", getMovieById);
router.delete("/deleteMovieById/:id", isLoggedIn, authorize, deleteMovieById);
router.post("/thumbImgUpload", isLoggedIn, authorize, thumbImgUpload);

export default router;
