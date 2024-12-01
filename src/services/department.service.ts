import Department from "../models/department.model";
import Division from "../models/division.model";
import { Op } from "sequelize";

class DepartmentService {
  // Create a new department
  async createDepartment(departmentData: Department) {
    try {
      // Check if department name already exists
      const existingDepartment = await Department.findOne({
        where: { name: departmentData.name },
      });

      if (existingDepartment) {
        throw new Error("Department with this name already exists");
      }

      return await Department.create(departmentData);
    } catch (error) {
      throw error;
    }
  }

  // Get department by ID with optional divisions
  async getDepartmentById(id: string, includeDetails: boolean = false) {
    const department = await Department.findByPk(id, {
      include: includeDetails
        ? [
            {
              model: Division,
              attributes: ["id", "name", "isActive"],
            },
          ]
        : [],
    });

    if (!department) {
      throw new Error("Department not found");
    }

    return department;
  }

  // Update department
  async updateDepartment(id: string, updateData: Partial<Department>) {
    const department = await Department.findByPk(id);

    if (!department) {
      throw new Error("Department not found");
    }

    // Check for name conflict if name is being updated
    if (updateData.name) {
      const existingDepartment = await Department.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingDepartment) {
        throw new Error("Department name already in use");
      }
    }

    return await department.update(updateData);
  }

  // Delete department
  async deleteDepartment(id: string) {
    const department = await Department.findByPk(id);

    if (!department) {
      throw new Error("Department not found");
    }

    // Optional: Add checks for existing divisions or users before deleting
    const existingDivisions = await Division.count({
      where: { departmentId: id },
    });

    if (existingDivisions > 0) {
      throw new Error("Cannot delete department with existing divisions");
    }

    return await department.destroy();
  }

  // List departments with optional filtering
  async listDepartments(
    filters: {
      isActive?: boolean;
      includeDetails?: boolean;
    } = {}
  ) {
    const { isActive, includeDetails } = filters;

    return await Department.findAll({
      where: isActive !== undefined ? { isActive } : {},
      include: includeDetails
        ? [
            {
              model: Division,
              attributes: ["id", "name", "isActive"],
            },
          ]
        : [],
    });
  }
}

export default new DepartmentService();
