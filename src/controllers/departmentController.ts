import { Request, Response } from "express";
import DepartmentService from "../services/department.service";

class DepartmentController {
  // Create a new department
  async createDepartment(req: Request, res: Response) {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      res.status(201).json({
        message: "Department created successfully",
        department: {
          id: department.id,
          name: department.name,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: "Error creating department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get department by ID
  async getDepartmentById(req: Request, res: Response) {
    try {
      const { includeDetails } = req.query;
      const department = await DepartmentService.getDepartmentById(
        req.params.id,
        includeDetails === "true"
      );
      res.status(200).json(department);
    } catch (error) {
      res.status(404).json({
        message: "Department not found",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update department
  async updateDepartment(req: Request, res: Response) {
    try {
      const updatedDepartment = await DepartmentService.updateDepartment(
        req.params.id,
        req.body
      );
      res.status(200).json({
        message: "Department updated successfully",
        department: updatedDepartment,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error updating department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete department
  async deleteDepartment(req: Request, res: Response) {
    try {
      await DepartmentService.deleteDepartment(req.params.id);
      res.status(200).json({
        message: "Department deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: "Error deleting department",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // List departments
  async listDepartments(req: Request, res: Response) {
    try {
      const { isActive, includeDetails } = req.query;
      const departments = await DepartmentService.listDepartments({
        isActive: isActive === "true",
        includeDetails: includeDetails === "true",
      });
      res.status(200).json(departments);
    } catch (error) {
      res.status(500).json({
        message: "Error listing departments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new DepartmentController();
