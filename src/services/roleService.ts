import Role from "../models/role.model";
import { Op } from "sequelize";

class RoleService {
  // Create a new role
  async createRole(roleData: Role) {
    try {
      // Check if role name already exists
      const existingRole = await Role.findOne({
        where: { name: roleData.name },
      });

      if (existingRole) {
        throw new Error("Role with this name already exists");
      }

      return await Role.create(roleData);
    } catch (error) {
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(id: string) {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  }

  // Update role
  async updateRole(id: string, updateData: Partial<Role>) {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new Error("Role not found");
    }

    // Check for name conflict if name is being updated
    if (updateData.name) {
      const existingRole = await Role.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingRole) {
        throw new Error("Role name already in use");
      }
    }

    return await role.update(updateData);
  }

  // Delete role
  async deleteRole(id: string) {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new Error("Role not found");
    }

    return await role.destroy();
  }

  // List all roles
  async listRoles() {
    return await Role.findAll();
  }
}

export default new RoleService();
