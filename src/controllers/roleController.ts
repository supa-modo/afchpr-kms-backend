import { Request, Response } from "express";
import RoleService from "../services/roleService";

class RoleController {
  // Create a new role
  async createRole(req: Request, res: Response) {
    try {
      const role = await RoleService.createRole(req.body);
      res.status(201).json({
        message: "Role created successfully",
        role: {
          id: role.id,
          name: role.name,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: "Error creating role",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get role by ID
  async getRoleById(req: Request, res: Response) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      res.status(200).json(role);
    } catch (error) {
      res.status(404).json({
        message: "Role not found",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update role
  async updateRole(req: Request, res: Response) {
    try {
      const updatedRole = await RoleService.updateRole(req.params.id, req.body);
      res.status(200).json({
        message: "Role updated successfully",
        role: updatedRole,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error updating role",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete role
  async deleteRole(req: Request, res: Response) {
    try {
      await RoleService.deleteRole(req.params.id);
      res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
      res.status(400).json({
        message: "Error deleting role",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // List roles
  async listRoles(req: Request, res: Response) {
    try {
      const roles = await RoleService.listRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({
        message: "Error listing roles",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new RoleController();
