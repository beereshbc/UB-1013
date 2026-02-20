import QRCode from "qrcode";
import patientModel from "../models/patientModel.js"; // Added .js extension for ES modules

export const syncPatientToDB = async (req, res) => {
  try {
    const { patientID, phone, email, walletAddress, initialRecords, doctorId } =
      req.body;

    // 1. Generate Smart QR Code
    // This encodes a URL so scanning it takes you directly to the patient's page
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const scanLink = `${frontendUrl}/doctor/patient/${patientID}`;
    const qrCodeImage = await QRCode.toDataURL(scanLink);

    // 2. Create New Patient Document
    const newPatient = new patientModel({
      patientID,
      phone,
      email,
      walletAddress,
      qrCode: qrCodeImage,
      recordsSnapshot: initialRecords, // Exact match of the blockchain payload
      createdBy: doctorId,
    });

    // 3. Save to MongoDB
    await newPatient.save();

    res.json({
      success: true,
      message: "Data mirrored to Cloud & QR Generated",
      qrCode: qrCodeImage,
    });
  } catch (error) {
    console.error("DB Sync Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Patient ID already exists in Cloud Database",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// FETCH QR CODE BY WALLET OR EMAIL
export const getPatientQR = async (req, res) => {
  try {
    const { walletAddress, email } = req.query;

    if (!walletAddress && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a walletAddress or email to search.",
      });
    }

    // Build the search query based on what was provided
    const searchQuery = {};
    if (walletAddress) searchQuery.walletAddress = walletAddress;
    if (email) searchQuery.email = email;

    // Search the database, but ONLY return the qrCode field to save bandwidth
    const patient = await patientModel.findOne(searchQuery).select("qrCode");

    if (!patient || !patient.qrCode) {
      return res.status(404).json({
        success: false,
        message: "No QR Code found for this identity.",
      });
    }

    res.json({
      success: true,
      qrCode: patient.qrCode,
    });
  } catch (error) {
    console.error("QR Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving QR Code.",
    });
  }
};
