import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(process.env.DB_NAME);
      console.log("✅ Connected to MongoDB Atlas");
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB", error);
      process.exit(1); // force quit if DB connection fails
    }
  }
  return db;
}
