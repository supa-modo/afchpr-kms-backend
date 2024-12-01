import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Op } from "sequelize";

interface LoginCredentials {
  username: string;
  password: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

class AuthService {
  // Secret keys (these should be stored in environment variables in a real application)
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly PASSWORD_RESET_SECRET =
    process.env.PASSWORD_RESET_SECRET || "password-reset-secret";

  // Token expiration times
  private readonly ACCESS_TOKEN_EXPIRY = "1h";
  private readonly REFRESH_TOKEN_EXPIRY = "7d";
  private readonly PASSWORD_RESET_TOKEN_EXPIRY = "1h";

  // Login method
  async login(credentials: LoginCredentials) {
    const { username, password } = credentials;

    // Find user by username
    const user = await User.findOne({
      where: {
        username: username.toLowerCase().trim(),
        isActive: true,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Logout method (mainly for invalidating refresh tokens)
  async logout(userId: string) {
    // In a production app, you'd typically invalidate the refresh token in a token blacklist or database
    // For now, we'll just update the last logout time
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return { message: "Logged out successfully" };
  }

  // Generate access token
  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
      },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
  }

  // Generate refresh token
  private generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
      },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as {
        id: string;
      };

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  // Initiate password reset
  async initiatePasswordReset(request: PasswordResetRequest) {
    const { email } = request;

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      throw new Error("No account associated with this email");
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHmac("sha256", this.PASSWORD_RESET_SECRET)
      .update(resetToken)
      .digest("hex");

    // Set token expiry
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Update user with reset token and expiry
    await user.update({
      passwordResetToken: hashedResetToken,
      passwordResetExpiry: resetTokenExpiry,
    });

    // Send password reset email (simplified)
    await this.sendPasswordResetEmail(user.email, resetToken);

    return { message: "Password reset link sent to your email" };
  }

  // Confirm password reset
  async confirmPasswordReset(request: PasswordResetConfirm) {
    const { token, newPassword } = request;

    // Hash the incoming token
    const hashedToken = crypto
      .createHmac("sha256", this.PASSWORD_RESET_SECRET)
      .update(token)
      .digest("hex");

    // Find user with matching token and not expired
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: {
          [Op.gt]: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Update password
    user.password = newPassword; // The beforeUpdate hook will hash the password
    await user.save();

    // Clear reset token fields
    // await user.update({
    //   passwordResetToken: null,
    //   passwordResetExpiry: null
    // });

    return { message: "Password reset successful" };
  }

  // Send password reset email (mock implementation)
  private async sendPasswordResetEmail(email: string, token: string) {
    // In a real application, use a proper email service like SendGrid or NodeMailer
    console.log(`Password Reset Email Sent to ${email}`);
    console.log(`Reset Token: ${token}`);

    // Simulate email sending
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: 'noreply@yourapp.com',
    //   to: email,
    //   subject: 'Password Reset',
    //   html: `Reset your password using this link: ${resetLink}`
    // });
  }
}

export default new AuthService();
