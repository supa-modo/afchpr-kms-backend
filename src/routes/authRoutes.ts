import express from "express";
import { body } from "express-validator";
import AuthController from "../controllers/authController";
// import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Login Route
router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  AuthController.login
);

// Logout Route (requires authentication)
// router.post("/logout", authMiddleware, AuthController.logout);

// Refresh Token Route
// router.post("/refresh-token", AuthController.refreshToken);

// Initiate Password Reset Route
router.post(
  "/reset-password",
  [body("email").trim().isEmail().withMessage("Valid email is required")],
  AuthController.initiatePasswordReset
);

// Confirm Password Reset Route
router.post(
  "/reset-password/confirm",
  [
    // body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain uppercase, lowercase, number, and special character"
      ),
  ],
  AuthController.confirmPasswordReset
);

export default router;
