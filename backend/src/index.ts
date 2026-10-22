import "dotenv/config";
import express from "express";
import { pool } from "./db.js";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.get("/health/db", async (req, res) => {
  try {
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
