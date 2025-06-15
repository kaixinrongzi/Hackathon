import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js"; // ✅ use full .js extension
import gamesRouter from "./routes/games.js"; // ✅ full path and extension

dotenv.config();

const app = express();
app.use(express.json());

app.use("/games", gamesRouter);

const PORT = 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  await connectDB(); // ✅ establish DB connection
});
