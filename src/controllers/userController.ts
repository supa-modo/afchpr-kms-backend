import { Request, Response } from "express";
import UserService from "../services/userService";

class UserController {
  // Create a new user
  async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({
        message: "User not found",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const updatedUser = await UserService.updateUser(req.params.id, req.body);
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error updating user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(req.params.id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(400).json({
        message: "Error deleting user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // List users
  async listUsers(req: Request, res: Response) {
    try {
      const { departmentId, divisionId, unitId, isActive } = req.query;
      const users = await UserService.listUsers({
        departmentId: departmentId as string,
        divisionId: divisionId as string,
        unitId: unitId as string,
        isActive: isActive === "true",
      });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        message: "Error listing users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new UserController();
