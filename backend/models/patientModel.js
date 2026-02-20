import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientID: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String },
    walletAddress: { type: String },
    qrCode: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
    recordsSnapshot: [
      {
        key: String,
        value: String,
        description: String,
        prescription: String,
        isConfidential: Boolean,
        authorWallet: String,
        authorName: String,
        timestamp: { type: Number }, // Changed to Number for Unix Timestamp
      },
    ],
  },
  { timestamps: true },
);

const patientModel =
  mongoose.models.patient || mongoose.model("patient", patientSchema);
export default patientModel;
