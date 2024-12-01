import Division from "../models/division.model";
import Department from "../models/department.model";
import Unit from "../models/unit.model";
import { Op } from "sequelize";

class DivisionService {
  // Create a new division
  async createDivision(divisionData: Division) {
    try {
      // Validate department exists
      const department = await Department.findByPk(divisionData.departmentId);
      if (!department) {
        throw new Error("Invalid department");
      }

      // Check if division name already exists within the department
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

      return await Division.create(divisionData);
    } catch (error) {
      throw error;
    }
  }

  // Get division by ID with optional units
  async getDivisionById(id: string, includeDetails: boolean = false) {
    const division = await Division.findByPk(id, {
      include: includeDetails
        ? [
            {
              model: Department,
              attributes: ["id", "name"],
            },
            {
              model: Unit,
              attributes: ["id", "name", "isActive"],
            },
          ]
        : [],
    });

    if (!division) {
      throw new Error("Division not found");
    }

    return division;
  }

  // Update division
  async updateDivision(id: string, updateData: Partial<Division>) {
    const division = await Division.findByPk(id);

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

    // Check for name conflict if name is being updated
    if (updateData.name) {
      const existingDivision = await Division.findOne({
        where: {
          name: updateData.name,
          departmentId: updateData.departmentId || division.departmentId,
          id: { [Op.ne]: id },
        },
      });

      if (existingDivision) {
        throw new Error("Division name already in use in this department");
      }
    }

    return await division.update(updateData);
  }

  // Delete division
  async deleteDivision(id: string) {
    const division = await Division.findByPk(id);

    if (!division) {
      throw new Error("Division not found");
    }

    // Check for existing units before deleting
    const existingUnits = await Unit.count({
      where: { divisionId: id },
    });

    if (existingUnits > 0) {
      throw new Error("Cannot delete division with existing units");
    }

    return await division.destroy();
  }

  // List divisions with optional filtering
  async listDivisions(
    filters: {
      departmentId?: string;
      isActive?: boolean;
      includeDetails?: boolean;
    } = {}
  ) {
    const { departmentId, isActive, includeDetails } = filters;

    return await Division.findAll({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: includeDetails
        ? [
            {
              model: Department,
              attributes: ["id", "name"],
            },
            {
              model: Unit,
              attributes: ["id", "name", "isActive"],
            },
          ]
        : [],
    });
  }
}

export default new DivisionService();
