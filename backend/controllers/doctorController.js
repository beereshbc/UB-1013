import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";

// Nodemailer Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Send OTP Email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "GoldenTime Security Verification",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #DBEAFE; border-radius: 10px;">
        <h2 style="color: #1E40AF;">Identity Verification Code</h2>
        <p>Your OTP for GoldenTime Doctor Access is:</p>
        <h1 style="letter-spacing: 5px; color: #0F172A;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// 1. Register Doctor (with Cloudinary Upload)
export const registerDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      hospitalName,
      specialization,
      walletAddress,
      licenseId,
    } = req.body;
    const files = req.files;

    if (!files || !files.degreeCertificate || !files.medicalLicense) {
      return res
        .status(400)
        .json({ success: false, message: "Credential files missing" });
    }

    // Helper to convert buffer to base64 for Cloudinary
    const uploadToCloudinary = async (fileBuffer) => {
      const base64File = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
      return await cloudinary.uploader.upload(base64File, {
        resource_type: "image",
      });
    };

    // Upload using buffers
    const degreeUpload = await uploadToCloudinary(
      files.degreeCertificate[0].buffer,
    );
    const licenseUpload = await uploadToCloudinary(
      files.medicalLicense[0].buffer,
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const doctor = new doctorModel({
      fullName,
      email,
      hospitalName,
      specialization,
      walletAddress,
      licenseId,
      degreeCertificate: degreeUpload.secure_url,
      medicalLicense: licenseUpload.secure_url,
      otp,
      otpExpires,
    });

    await doctor.save();
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to email. Complete verification.",
    });
  } catch (error) {
    console.error("Cloudinary/DB Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Login Doctor (Enforces Admin Status)
export const loginDoctor = async (req, res) => {
  try {
    const { email, walletAddress } = req.body;

    // 1. Validation Check
    if (!email || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Email and Wallet Address are required for authentication.",
      });
    }

    // 2. Find Doctor (Case-insensitive email check is safer)
    const doctor = await doctorModel.findOne({
      email: email.toLowerCase(),
      walletAddress,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor node not found. Please verify your credentials or register.",
      });
    }

    // 3. Admin Access Control Checks
    if (doctor.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied: Your account has been blocked by the administrator.",
      });
    }

    if (doctor.status === "pending") {
      return res.status(403).json({
        success: false,
        message:
          "Pending Approval: Your credentials are still under review by the admin.",
      });
    }

    if (doctor.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Your registration node was rejected.",
      });
    }

    // 4. Generate Security Code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    doctor.otp = otp;
    doctor.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Min Expiry

    await doctor.save();

    // 5. Attempt Email Dispatch
    try {
      await sendOtpEmail(doctor.email, otp);
      res.json({
        success: true,
        message: "Security code dispatched to your registered email.",
      });
    } catch (emailError) {
      console.error("Mailing Service Error:", emailError);
      return res.status(500).json({
        success: false,
        message:
          "Failed to send OTP. Please check your internet or email configuration.",
      });
    }
  } catch (error) {
    console.error("Login Controller Crash:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

// 3. Verify OTP & Issue 1-Day Token
export const verifyDoctorOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor || doctor.otp !== otp || doctor.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    doctor.otp = null;
    doctor.otpExpires = null;
    doctor.isVerified = true;
    await doctor.save();

    // Create Token (valid for 24 hours)
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send token to frontend
    res.json({
      success: true,
      token,
      message: "Node Authenticated Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 4. Get Profile (Protected)
export const getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.body; // Injected by doctorAuth middleware
    const doctorData = await doctorModel
      .findById(doctorId)
      .select("-otp -otpExpires");
    if (!doctorData || doctorData.isBlocked)
      return res.status(404).json({ success: false, message: "Access Denied" });

    res.json({ success: true, doctorData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};
