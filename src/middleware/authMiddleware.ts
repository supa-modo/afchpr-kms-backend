import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        roleId: string;
      };
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Extract token (expecting "Bearer <token>")
  const token = authHeader.split(" ")[1];

  try {
    // Secret key should be in environment variables
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      roleId: string;
    };

    // Attach user to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      roleId: decoded.roleId,
    };

    next();
  } catch (error) {
    // Handle different types of JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(500).json({ message: "Authentication error" });
  }
};

export default authMiddleware;
