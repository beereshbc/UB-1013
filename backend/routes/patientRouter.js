import express from "express";
import {
  getPatientQR,
  syncPatientToDB,
} from "../controllers/patientController.js";
import doctorAuth from "../middlewares/doctorAuth.js";

const patientRouter = express.Router();

patientRouter.get("/qr", getPatientQR);
// Route: POST /api/patient/sync
patientRouter.post("/sync", doctorAuth, syncPatientToDB);

export default patientRouter;
