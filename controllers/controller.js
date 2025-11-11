import Detection from "../models/detectionModel.js";
import {Supervisor, Worker} from "../models/userModel.js";
import bcrypt from "bcrypt";

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

export async function loginSupervisor(req, res) {
  try {
    const payload = req.body;
    if (!payload.password) return res.status(406).send({ msg: "Input password" });
    if (!payload.supervisorID) return res.status(406).send({ msg: "Input supervisorID" });
    
    const user = await Supervisor.findOne({ supervisorID: payload.supervisorID });
    if (!user) return res.status(401).send({ msg: "Invalid credentials" });

    const check = await bcrypt.compare(payload.password, user.password);

    if (!check) return res.status(401).send({ msg: "Invalid credentials" });

    return res.send({ msg: "Login Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}
export async function loginWorker(req, res) {
  try {
    const payload = req.body;
    if (!payload.workerID) return res.status(406).send({ msg: "Input workerID" });
    
    const user = await Worker.findOne({ workerID: payload.workerID });
    if (!user) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }

    return res.send({ msg: "Login Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
}
