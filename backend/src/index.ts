
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Payment app backend is running!");
});

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
