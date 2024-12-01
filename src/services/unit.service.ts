// src/services/unit.service.ts
import Unit from "../models/unit.model";
import Division from "../models/division.model";
import Department from "../models/department.model";
import User from "../models/user.model";
import { v4 as uuidv4 } from "uuid";

interface UnitCreationDTO {
  divisionId: string;
  name: string;
  description?: string;
}

interface UnitUpdateDTO {
  divisionId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

class UnitService {
  // Create a new unit
  async createUnit(unitData: UnitCreationDTO): Promise<Unit> {
    try {
      // Validate division exists
      const division = await Division.findByPk(unitData.divisionId);
      if (!division) {
        throw new Error("Invalid division");
      }

      // Check if unit with the same name in the division already exists
      const existingUnit = await Unit.findOne({
        where: {
          name: unitData.name,
          divisionId: unitData.divisionId,
        },
      });

      if (existingUnit) {
        throw new Error("Unit with this name already exists in the division");
      }

      // Create unit
      return await Unit.create({
        ...unitData,
        id: uuidv4(),
        isActive: true,
      });
    } catch (error) {
      console.error("Unit creation error:", error);
      throw error;
    }
  }

  // Update unit details
  async updateUnit(unitId: string, updateData: UnitUpdateDTO): Promise<Unit> {
    try {
      const unit = await Unit.findByPk(unitId);

      if (!unit) {
        throw new Error("Unit not found");
      }

      // Validate division if provided
      if (updateData.divisionId) {
        const division = await Division.findByPk(updateData.divisionId);
        if (!division) {
          throw new Error("Invalid division");
        }
      }

      // Check for unique unit name within the division
      if (updateData.name) {
        const existingUnit = await Unit.findOne({
          where: {
            name: updateData.name,
            divisionId: updateData.divisionId || unit.divisionId,
          },
        });

        if (existingUnit && existingUnit.id !== unitId) {
          throw new Error("Unit name must be unique within the division");
        }
      }

      return await unit.update(updateData);
    } catch (error) {
      console.error("Unit update error:", error);
      throw error;
    }
  }

  // Get unit by ID with associated data
  async getUnitById(unitId: string) {
    return await Unit.findByPk(unitId, {
      include: [
        {
          model: Division,
          as: "division",
          include: [{ model: Department, as: "department" }],
        },
        { model: User, as: "users" },
      ],
    });
  }

  // Soft delete unit
  async deactivateUnit(unitId: string): Promise<void> {
    const unit = await Unit.findByPk(unitId);

    if (!unit) {
      throw new Error("Unit not found");
    }

    await unit.update({ isActive: false });
  }

  // List units with optional filtering
  async listUnits(
    filters: {
      divisionId?: string;
      isActive?: boolean;
    } = {}
  ) {
    return await Unit.findAll({
      where: filters,
      include: [
        {
          model: Division,
          as: "division",
          include: [{ model: Department, as: "department" }],
        },
        { model: User, as: "users" },
      ],
    });
  }
}

export default new UnitService();
