// src/services/division.service.ts
import Division from "../models/division.model";
import Department from "../models/department.model";
import Unit from "../models/unit.model";
import User from "../models/user.model";
import { v4 as uuidv4 } from "uuid";

interface DivisionCreationDTO {
  departmentId: string;
  name: string;
  description?: string;
}

interface DivisionUpdateDTO {
  departmentId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

class DivisionService {
  // Create a new division
  async createDivision(divisionData: DivisionCreationDTO): Promise<Division> {
    try {
      // Validate department exists
      const department = await Department.findByPk(divisionData.departmentId);
      if (!department) {
        throw new Error("Invalid department");
      }

      // Check if division with the same name in the department already exists
      const existingDivision = await Division.findOne({
        where: {
          name: divisionData.name,
          departmentId: divisionData.departmentId,
        },
      });

      if (existingDivision) {
        throw new Error(
          "Division with this name already exists in the department"
        );
      }

      // Create division
      return await Division.create({
        ...divisionData,
        id: uuidv4(),
        isActive: true,
      });
    } catch (error) {
      console.error("Division creation error:", error);
      throw error;
    }
  }

  // Update division details
  async updateDivision(
    divisionId: string,
    updateData: DivisionUpdateDTO
  ): Promise<Division> {
    try {
      const division = await Division.findByPk(divisionId);

      if (!division) {
        throw new Error("Division not found");
      }

      // Validate department if provided
      if (updateData.departmentId) {
        const department = await Department.findByPk(updateData.departmentId);
        if (!department) {
          throw new Error("Invalid department");
        }
      }

      // Check for unique division name within the department
      if (updateData.name) {
        const existingDivision = await Division.findOne({
          where: {
            name: updateData.name,
            departmentId: updateData.departmentId || division.departmentId,
          },
        });

        if (existingDivision && existingDivision.id !== divisionId) {
          throw new Error("Division name must be unique within the department");
        }
      }

      return await division.update(updateData);
    } catch (error) {
      console.error("Division update error:", error);
      throw error;
    }
  }

  // Get division by ID with associated data
  async getDivisionById(divisionId: string) {
    return await Division.findByPk(divisionId, {
      include: [
        { model: Department, as: "department" },
        { model: Unit, as: "units" },
        { model: User, as: "users" },
      ],
    });
  }

  // Soft delete division
  async deactivateDivision(divisionId: string): Promise<void> {
    const division = await Division.findByPk(divisionId);

    if (!division) {
      throw new Error("Division not found");
    }

    await division.update({ isActive: false });
  }

  // List divisions with optional filtering
  async listDivisions(
    filters: {
      departmentId?: string;
      isActive?: boolean;
    } = {}
  ) {
    return await Division.findAll({
      where: filters,
      include: [
        { model: Department, as: "department" },
        { model: Unit, as: "units" },
        { model: User, as: "users" },
      ],
    });
  }
}

export default new DivisionService();
