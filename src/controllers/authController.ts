import { Request, Response } from "express";
import AuthService from "../services/authService";
// import { validationResult } from "express-validator";

class AuthController {
  // Login
  async login(req: Request, res: Response) {
    try {
      // Validate request body
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      const { username, password } = req.body;
      const loginResult = await AuthService.login({ username, password });

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", loginResult.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: "Login successful",
        user: loginResult.user,
        accessToken: loginResult.tokens.accessToken,
      });
    } catch (error) {
      res.status(401).json({
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }


  // Refresh Access Token
  async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from cookies
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const { accessToken } = await AuthService.refreshAccessToken(
        refreshToken
      );

      res.status(200).json({ accessToken });
    } catch (error) {
      res.status(401).json({
        message: "Token refresh failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Initiate Password Reset
  async initiatePasswordReset(req: Request, res: Response) {
    try {
      // Validate request body
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      const { email } = req.body;
      const result = await AuthService.initiatePasswordReset({ email });

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: "Password reset initiation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Confirm Password Reset
  async confirmPasswordReset(req: Request, res: Response) {
    try {
      // Validate request body
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      const { token, newPassword } = req.body;
      const result = await AuthService.confirmPasswordReset({
        token,
        newPassword,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: "Password reset failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new AuthController();
