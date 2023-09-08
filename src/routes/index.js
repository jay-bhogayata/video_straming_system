import { Router } from "express";
import authRoutes from "./auth.routes.js";
import movieRoutes from "./movie.routes.js";

const router = new Router();

router.use("/auth", authRoutes);
router.use("/movie", movieRoutes);

export default router;
