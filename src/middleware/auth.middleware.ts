// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Role from "../models/role.model";

// Define the JWT payload interface
interface JwtPayload {
  userId: string;
  roleId: string;
}

// Authentication middleware
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract the token (assuming 'Bearer <token>')
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Find the user
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: "role" }],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to the request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Authorization middleware generator
// export const authorizeRoles = (requiredPermissions: string[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // User should be attached by authenticateUser middleware
//       const user = req.user;

//       if (!user) {
//         return res.status(401).json({ message: "User not authenticated" });
//       }

//       const userRole = user.roleId;

// Check if any of the required permissions are met
//   const hasPermission = requiredPermissions.some((permission) => {
//     switch (permission) {
//       case "viewPublic":
//         return userRole.canViewPublic;
//       case "viewDepartment":
//         return userRole.canViewDepartment;
//       case "viewDivision":
//         return userRole.canViewDivision;
//       case "viewUnit":
//         return userRole.canViewUnit;
//       case "uploadDocument":
//         return userRole.canUploadDocument;
//       case "deleteDocument":
//         return userRole.canDeleteDocument;
//       default:
//         return false;
//     }
//   });

//   if (!hasPermission) {
//     return res.status(403).json({ message: "Insufficient permissions" });
//   }

//   next();
// } catch (error) {
//   console.error("Authorization error:", error);
//   res.status(500).json({ message: "Internal server error" });
// }
//   };
// };

// Enhance Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
