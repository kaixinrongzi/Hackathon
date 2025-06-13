const express = require("express");
const app = express();
require("dotenv").config();

const { connectDB } = require("./db"); // ✅ import the connectDB function
const gamesRouter = require("./routes/games");

app.use(express.json());
app.use("/games", gamesRouter);

const PORT = 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  await connectDB(); // ✅ now this works
});
