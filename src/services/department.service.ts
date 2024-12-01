// src/services/department.service.ts
import Department from "../models/department.model";
import Division from "../models/division.model";
import User from "../models/user.model";
import { v4 as uuidv4 } from "uuid";

interface DepartmentCreationDTO {
  name: string;
  description?: string;
}

interface DepartmentUpdateDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

class DepartmentService {
  // Create a new department
  async createDepartment(
    departmentData: DepartmentCreationDTO
  ): Promise<Department> {
    try {
      // Check if department with the same name already exists
      const existingDepartment = await Department.findOne({
        where: { name: departmentData.name },
      });

      if (existingDepartment) {
        throw new Error("Department with this name already exists");
      }

      // Create department
      return await Department.create({
        ...departmentData,
        id: uuidv4(),
        isActive: true,
      });
    } catch (error) {
      console.error("Department creation error:", error);
      throw error;
    }
  }

  // Update department details
  async updateDepartment(
    departmentId: string,
    updateData: DepartmentUpdateDTO
  ): Promise<Department> {
    try {
      const department = await Department.findByPk(departmentId);

      if (!department) {
        throw new Error("Department not found");
      }

      // If updating name, check for existing departments
      if (updateData.name) {
        const existingDepartment = await Department.findOne({
          where: { name: updateData.name },
        });

        if (existingDepartment && existingDepartment.id !== departmentId) {
          throw new Error("Department name must be unique");
        }
      }

      return await department.update(updateData);
    } catch (error) {
      console.error("Department update error:", error);
      throw error;
    }
  }

  // Get department by ID with associated data
  async getDepartmentById(departmentId: string) {
    return await Department.findByPk(departmentId, {
      include: [
        { model: Division, as: "divisions" },
        { model: User, as: "users" },
      ],
    });
  }

  // Soft delete department
  async deactivateDepartment(departmentId: string): Promise<void> {
    const department = await Department.findByPk(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    await department.update({ isActive: false });
  }

  // List departments with optional filtering
  async listDepartments(filters: { isActive?: boolean } = {}) {
    return await Department.findAll({
      where: filters,
      include: [
        { model: Division, as: "divisions" },
        { model: User, as: "users" },
      ],
    });
  }
}

export default new DepartmentService();
