import JsonWebToken from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const jwt = req.cookies.jwt || req.headers.authorization?.split(" ")[1];;
  if (!jwt)
    return res
      .status(401 )
      .json({ success: false, message: "Unauthorized - no cookie issued" });

  try {
    const decoded = JsonWebToken.verify(jwt, process.env.JWT_SECRET);

    if (!decoded) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized -  invalid token" });
    }
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("Error is verifyToken", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
