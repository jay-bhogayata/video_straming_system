import express from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200);
  res.json({
    message: "backend is working fine.",
  });
});

export default app;
