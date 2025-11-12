import Detection from "../models/detectionModel.js";
import {Supervisor, Worker} from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

export async function getWorkers(req, res) {
  try {

    const supervisor = await Supervisor.findOne({ supervisorID: req.params.id });
    if (!supervisor) {
      return res.status(404).send({ msg: "Supervisor not found" });
    }
    const workers = await Worker.find({ supervisor: supervisor._id }).populate('detections');

    return res.send({ data: workers });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}

export async function addDummyDetection(req, res) {
  try {

    const detection1 = new Detection({
      warnLabel: "Cracks",
      worker: "6913b2a56c0888f49a468167",
      timeStamp: new Date("2025-11-10T14:48:00Z"),
    });

    detection1.save();
    return res.send({ msg: "Detection added" });
    
  } catch (error) {
    
  }
}
export async function addDetection(req, res) {
  try {
    const payload = req.body;
    const { detections } = payload;

    if (!detections || !Array.isArray(detections) || detections.length === 0) {
      return res.status(400).send({ msg: "Invalid detections data" });
    }

    const workerID = req.user.workerID;
    if (!workerID) {
      return res.status(401).send({ msg: "Unauthorized: No worker ID in token" });
    }

    const worker = await Worker.findOne({ workerID });
    if (!worker) {
      return res.status(404).send({ msg: "Worker not found" });
    }

    const savedDetections = await Detection.insertMany(
      detections.map((detection) => ({
        warnLabel: detection.label,
        timeStamp: new Date(detection.timestamp),
        worker: worker._id,
        location: {
          type: "Point",
          coordinates: detection.location.coordinates || [0, 0]
        }
      }))
    );

    return res.send({ 
      msg: "Detections added successfully", 
      count: savedDetections.length,
      detections: savedDetections 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}

export async function loginSupervisor(req, res) {
  try {
    const payload = req.body;
    if (!payload.password) return res.status(406).send({ msg: "Input password" });
    if (!payload.supervisorID) return res.status(406).send({ msg: "Input supervisorID" });
    
    const user = await Supervisor.findOne({ supervisorID: payload.supervisorID });
    if (!user) return res.status(401).send({ msg: "Invalid id" });

    const check = await bcrypt.compare(payload.password, user.password);

    if (!check) return res.status(401).send({ msg: "Invalid pass" });
    
    const token = jwt.sign(
      { supervisorID: user.supervisorID, id: user._id, role: "supervisor" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.send({ msg: "Login Successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}
export async function loginWorker(req, res) {
  try {
    const payload = req.body;
    if (!payload.workerID) return res.status(406).send({ msg: "Input workerID" });
    
    const user = await Worker.findOne({ workerID: payload.workerID }).populate('supervisor');
    if (!user) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }

    user.isLoggedIn = true;
    await user.save();


    const token = jwt.sign(
      { workerID: user.workerID, id: user._id, role: "worker", remember: payload.remember },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.send({ msg: "Login Successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}
export async function logoutWorker(req, res) {
  try {
    const payload = req.body;
    if (!payload.workerID) return res.status(406).send({ msg: "Input workerID" });
    
    const user = await Worker.findOne({ workerID: payload.workerID });
    if (!user) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }

    user.isLoggedIn = false;
    await user.save();

    return res.send({ msg: "logout Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}
