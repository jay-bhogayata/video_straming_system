import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.status(200);
  res.json({
    message: "backend is working fine.",
  });
});

export default app;
