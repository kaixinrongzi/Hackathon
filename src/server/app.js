import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import gamesRouter from "./routes/games.js";
import cors from "cors";

dotenv.config(); // ✅ load env first

const app = express(); // ✅ define `app` before using it
app.use(cors());
app.use(express.json());

app.use("/games", gamesRouter);

const PORT = 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  await connectDB(); // optional: establish DB connection at startup
});
