import express from "express";
import cors from "cors";
import "dotenv/config"; // Ensure .env is loaded first
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongoDB.js";
import doctorRouter from "./routes/doctorRouter.js";
import adminRouter from "./routes/adminRouter.js";
import patientRouter from "./routes/patientRouter.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
await connectDB();
await connectCloudinary();
app.use("/api/doctor", doctorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/patient", patientRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server Node Active on ${PORT}`));
