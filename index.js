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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);

const uri = process.env.MONGODB_URI;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const createDummyData = async () => {
  try {
    await Worker.deleteMany({});
    await Supervisor.deleteMany({});
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
      isLoggedIn: true,
    });

    await worker1.save();
    await worker2.save();

    const detection1 = new Detection({
      warnLabel: "Crack",
      worker: worker1._id,
      timeStamp: new Date("2025-11-10T14:48:00Z"),
    });

    const detection2 = new Detection({
      warnLabel: "Fall",
      worker: worker2._id,
      timeStamp: new Date("2025-11-12T01:15:00Z"),
    });

    const detection3 = new Detection({
      warnLabel: "Corrosion",
      worker: worker1._id,
      timeStamp: new Date("2025-11-13T09:30:00Z"),
    });

    await detection1.save();
    await detection2.save();
    await detection3.save();

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
    });
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
