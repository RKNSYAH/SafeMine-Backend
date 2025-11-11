import express, { Router } from "express";
import serverless from "serverless-http";
import router from "../../router/router";
import cors from "cors";
import mongoose from "mongoose";

const api = express();

api.use(cors());
api.use(express.json());

const uri = process.env.MONGODB_URI;
let conn = null;

const connectToDatabase = async () => {
  if (conn == null) {
    console.log("Creating new connection to MongoDB...");
    try {
      conn = await mongoose.connect(uri, {
        // These options are good for serverless
        serverSelectionTimeoutMS: 5000 
      });
      console.log("Successfully connected to MongoDB!");
      return conn;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  console.log("Using cached MongoDB connection.");
  return conn;
};


api.use('/api', async (req, res, next) => {
  try {
    await connectToDatabase();
    next(); 
  } catch (error) {
    res.status(500).send({ msg: "Database connection failed" });
  }
}, router);

export const handler = serverless(api);