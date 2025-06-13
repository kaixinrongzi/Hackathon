// routes/games.js
const express = require("express");
const fs = require("fs");
const path = require("path"); // ✅ ADDED: to build correct file path
const router = express.Router();
const { connectDB } = require("../db");

router.post("/insert", async (req, res) => {
  const db = await connectDB();
  const games = db.collection("games_test");

  try {
    // ✅ CHANGED: read file as string and split into lines
    const filePath = path.join(__dirname, "../../../data/games_data_1_sample.json");
    const lines = fs.readFileSync(filePath, "utf8").split("\n");

    // ✅ CHANGED: parse each non-empty line as a JSON object
    const data = lines
      .filter(line => line.trim() !== "") // skip empty lines
      .map(line => JSON.parse(line));     // parse each line

    // ✅ UNCHANGED: insert documents
    const result = await games.insertMany(data);
    res.status(200).send({ message: "Games inserted", count: result.insertedCount });

  } catch (error) {
    // ✅ UNCHANGED: handle errors
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
