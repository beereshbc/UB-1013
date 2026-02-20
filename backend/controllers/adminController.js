import jwt from "jsonwebtoken";

// 1. Admin Login Logic
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check against Environment Variables
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Create Admin Token
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.json({
        success: true,
        token,
        message: "Welcome, System Administrator",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid Admin Credentials",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import doctorModel from "../models/doctorModel.js";

// Get all doctors for the dashboard
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-otp -otpExpires");
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Doctor Status (approved, rejected, pending)
export const changeDoctorStatus = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    await doctorModel.findByIdAndUpdate(doctorId, { status });
    res.json({ success: true, message: `Doctor status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Block/Unblock Doctor
export const toggleBlockDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await doctorModel.findById(doctorId);

    // Toggle boolean value
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { isBlocked: !doctor.isBlocked },
      { new: true },
    );

    res.json({
      success: true,
      message: updatedDoctor.isBlocked
        ? "Doctor Node Blocked"
        : "Doctor Node Unblocked",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
