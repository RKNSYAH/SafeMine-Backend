import express from "express";
import dotenv from "dotenv";
import router from "./router/router.js";
import cors from "cors";
import mongoose from "mongoose";
import { Supervisor, Worker } from "./models/userModel.js";
import Detection from "./models/detectionModel.js";
import bcrypt from "bcrypt";
dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://safemine-production-4a64.up.railway.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(router);

const uri = process.env.MONGODB_URI;
const clientOptions = {
  serverSelectionTimeoutMS: 5000 
};

const createDummyData = async () => {
  try {
    await Worker.deleteMany({});
    await Supervisor.deleteMany({});
    await Detection.deleteMany({});
    console.log("Old data cleared.");

    const salt = await bcrypt.genSalt(10);
    const supervisorPassword = await bcrypt.hash("super123", salt);

    const supervisor1 = new Supervisor({
      name: "John Doe",
      supervisorID: 101,
      password: supervisorPassword,
    });

    await supervisor1.save();

    const worker1 = new Worker({
      fullName: "Alice Smith",
      workerID: 11,
      supervisor: supervisor1._id,
      isLoggedIn: false,
    });

    const worker2 = new Worker({
      fullName: "Bob Johnson",
      workerID: 12,
      supervisor: supervisor1._id,
      isLoggedIn: false,
    });

    await worker1.save();
    await worker2.save();


    console.log("--- DUMMY DATA CREATED SUCCESSFULLY ---");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })
    await createDummyData()
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

process.on("SIGINT", async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB connection closed gracefully");
  } catch (error) {
    console.error("Error while closing MongoDB connection:", error);
  } finally {
    process.exit(0);
  }
});
