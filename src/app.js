import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.status(200);
  res.json({
    message: "backend is working fine.",
  });
});

// if no route is matched by now, it must be a 404
app.all("*", (_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
