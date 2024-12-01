// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Role from "../models/role.model";

class AuthController {
  // User login
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await User.findOne({
        where: { username },
        include: [{ model: Role, as: "role" }],
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: "User account is not active" });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      const token = jwt.sign(
        {
          userId: user.id,
          roleId: user.roleId,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: user.username,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // User logout (client-side token invalidation)
  async logout(req: Request, res: Response) {
    // In a JWT-based authentication, logout is typically handled client-side
    // by removing the token. Here we can add additional logout logic if needed.
    res.json({ message: "Logout successful" });
  }

  // Password reset request
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate password reset token
      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      // TODO: Implement email sending logic to send reset link
      // This would typically involve:
      // 1. Generating a unique reset link
      // 2. Sending an email with the reset link
      // 3. Storing the reset token in the database

      res.json({
        message: "Password reset link sent",
        // In a real app, you wouldn't send the token directly
        // This is just for demonstration
        resetToken,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      // Verify reset token
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // Find user
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await user.update({ password: hashedPassword });

      res.json({ message: "Password reset successful" });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new AuthController();
