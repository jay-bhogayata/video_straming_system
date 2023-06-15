import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = new Router();

router.use("/auth", authRoutes);

export default router;
