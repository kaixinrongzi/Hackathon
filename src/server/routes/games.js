import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "../db.js";
import { GoogleGenAI } from "@google/genai";

import StreamChainPkg from "stream-chain";
const { chain } = StreamChainPkg;
import StreamJsonPkg from "stream-json";
const { parser } = StreamJsonPkg;
import StreamObjectPkg from "stream-json/streamers/StreamObject.js";
const { streamObject } = StreamObjectPkg;

dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post("/insert", async (req, res) => {
  const db = await connectDB();
  const games = db.collection("games_with_website");

  try {
    const filePath = path.join(__dirname, "../../../data/games.json");

    // async generator for streaming
    async function* parseJSONStream(filePath) {
      const pipeline = chain([
        fs.createReadStream(filePath),
        parser(),
        streamObject()
      ]);

      for await (const { key, value } of pipeline) {
        yield { id: key, game: value };
      }
    }

    const batchSize = 100;
    let batch = [];
    let totalInserted = 0;
    let processedCount = 0;

    const startIndex = parseInt(req.query.startIndex || 0);
    let validIndex = 0;

    for await (const { id, game } of parseJSONStream(filePath)) {
      if (!game.name || !game.detailed_description || !game.website) continue;

      if (validIndex < startIndex) {
        validIndex++;
        continue;
      }
      validIndex++; 

      const inputText = [
        game.name,
        game.detailed_description,
        game.about_the_game || "",
        game.short_description || "",
        ...(game.categories || []),
        ...(game.genres || [])
      ].join("\n");

      try {
        const response = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: [inputText],
        });

        const embedding = response.embeddings[0].values;

        batch.push({
          name: game.name,
          header_image: game.header_image || null,
          website: game.website || null,
          embedding,
        });

        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} entries...`);
        }

        if (batch.length === batchSize) {
          const result = await games.insertMany(batch);
          totalInserted += result.insertedCount;
          console.log(`Inserted batch of ${result.insertedCount} games`);

          batch = [];

          console.log("Waiting 1 minute to respect Gemini quota...");
          await sleep(60000);
        }

      } catch (err) {
        console.error(`Embedding error for game id ${id}:`, err);
      }
    }

    // Insert remaining games if any ===
    if (batch.length > 0) {
      const result = await games.insertMany(batch);
      totalInserted += result.insertedCount;
      console.log(`Inserted final batch of ${result.insertedCount} games`);
    }

    if (totalInserted === 0) {
      return res.status(400).send({ message: "No valid game entries found after processing." });
    }

    res.status(200).send({ message: "Games inserted", count: totalInserted });

  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).send({ error: error.message });
  }
});


router.delete("/delete-all", async (req, res) => {
  const db = await connectDB();
  const games = db.collection("games_test_2");

  try {
    const result = await games.deleteMany({});
    res.status(200).send({ message: "All games deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send({ error: err.message });
  }
});

router.get("/query", async (req, res) => {
  const db = await connectDB();
  const games = db.collection("games_with_website");

  const queryText = req.query.query;
  if (!queryText || typeof queryText !== "string") {
    return res.status(400).send({ message: "Missing or invalid 'query' parameter in URL." });
  }

  try {
    // 1. Get embedding for the query
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [queryText],
    });

    const queryEmbedding = response.embeddings[0].values;

    // 2. Perform vector similarity search
    const results = await games.aggregate([
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit: 5,
          index: "embedding_index",
        }
      },
      {
        $project: {
          name: 1,
          website: 1,
          header_image: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();

    res.status(200).send({ results });

  } catch (err) {
    console.error("Query error:", err);
    res.status(500).send({ error: err.message });
  }
});

export default router;
