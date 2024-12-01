import { Request, Response } from "express";
import DivisionService from "../services/division.service";

class DivisionController {
  // Create a new division
  async createDivision(req: Request, res: Response) {
    try {
      const division = await DivisionService.createDivision(req.body);
      res.status(201).json({
        message: "Division created successfully",
        division: {
          id: division.id,
          name: division.name,
          departmentId: division.departmentId,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: "Error creating division",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get division by ID
  async getDivisionById(req: Request, res: Response) {
    try {
      const { includeDetails } = req.query;
      const division = await DivisionService.getDivisionById(
        req.params.id,
        includeDetails === "true"
      );
      res.status(200).json(division);
    } catch (error) {
      res.status(404).json({
        message: "Division not found",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update division
  async updateDivision(req: Request, res: Response) {
    try {
      const updatedDivision = await DivisionService.updateDivision(
        req.params.id,
        req.body
      );
      res.status(200).json({
        message: "Division updated successfully",
        division: updatedDivision,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error updating division",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete division
  async deleteDivision(req: Request, res: Response) {
    try {
      await DivisionService.deleteDivision(req.params.id);
      res.status(200).json({
        message: "Division deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: "Error deleting division",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // List divisions
  async listDivisions(req: Request, res: Response) {
    try {
      const { departmentId, isActive, includeDetails } = req.query;
      const divisions = await DivisionService.listDivisions({
        departmentId: departmentId as string,
        isActive: isActive === "true",
        includeDetails: includeDetails === "true",
      });
      res.status(200).json(divisions);
    } catch (error) {
      res.status(500).json({
        message: "Error listing divisions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new DivisionController();
