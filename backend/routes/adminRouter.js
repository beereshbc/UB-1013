import express from "express";
import {
  loginAdmin,
  getAllDoctors,
  changeDoctorStatus,
  toggleBlockDoctor,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
// import adminAuth from "../middlewares/adminAuth.js"; // Highly recommended to create this

const adminRouter = express.Router();

adminRouter.post("/login", upload.none(), loginAdmin);

// Dashboard management routes
adminRouter.get("/all-doctors", getAllDoctors);
adminRouter.post("/change-status", upload.none(), changeDoctorStatus);
adminRouter.post("/toggle-block", upload.none(), toggleBlockDoctor);

export default adminRouter;
