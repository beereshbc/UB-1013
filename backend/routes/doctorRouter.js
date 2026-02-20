import express from "express";
import upload from "../middlewares/multer.js";
import doctorAuth from "../middlewares/doctorAuth.js";
import {
  registerDoctor,
  loginDoctor,
  verifyDoctorOtp,
  getDoctorProfile,
} from "../controllers/doctorController.js";

const doctorRouter = express.Router();

doctorRouter.post(
  "/register",
  upload.fields([
    { name: "degreeCertificate", maxCount: 1 },
    { name: "medicalLicense", maxCount: 1 },
  ]),
  registerDoctor,
);

// Login: handles text-only FormData
doctorRouter.post("/login", upload.none(), loginDoctor);
doctorRouter.post("/verify-otp", verifyDoctorOtp);
doctorRouter.get("/get-profile", doctorAuth, getDoctorProfile);

export default doctorRouter;
