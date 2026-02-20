import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hospitalName: { type: String, required: true },
    specialization: { type: String, required: true },
    walletAddress: { type: String, required: true, unique: true },
    licenseId: { type: String, required: true },
    degreeCertificate: { type: String, required: true }, // Cloudinary URL
    medicalLicense: { type: String, required: true }, // Cloudinary URL

    // Admin Controls
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isBlocked: { type: Boolean, default: false },

    // Security
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
