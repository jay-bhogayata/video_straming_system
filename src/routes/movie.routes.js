import { Router } from "express";
import {
  addMovie,
  transcode,
  uploadVideo,
  getMovie,
  getMovieById,
  deleteMovieById,
  test,
} from "../controllers/video.controller.js";

const router = new Router();

router.post("/addMovie", addMovie);
router.get("/getAllMovie", getMovie);
router.post("/upload", uploadVideo);
router.post("/transcode", transcode);
router.get("/getMovieById/:id", getMovieById);
router.delete("/deleteMovieById/:id", deleteMovieById);
router.get("/test", test);

export default router;
