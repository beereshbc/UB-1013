import jwt from "jsonwebtoken";

const patientAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    );

    req.patientId = decodedToken.id; // Attach the DB ID to the request
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Session expired or invalid token." });
  }
};

export default patientAuth;
