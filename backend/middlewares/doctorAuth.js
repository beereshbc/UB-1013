import jwt from "jsonwebtoken";

const doctorAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided. Please login." });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Add doctor ID to the request object for use in controllers
    req.body.doctorId = decodedToken.id;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Session expired or invalid token." });
  }
};

export default doctorAuth;
