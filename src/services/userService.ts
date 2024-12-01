import User from "../models/user.model";
import Role from "../models/role.model";
import { Op } from "sequelize";

class UserService {
  // Create a new user
  async createUser(userData: User) {
    try {
      // Check if email or username already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: userData.email }, { username: userData.username }],
        },
      });

      if (existingUser) {
        throw new Error("Email or username already exists");
      }

      // Validate role exists
      const role = await Role.findByPk(userData.roleId);
      if (!role) {
        throw new Error("Invalid role");
      }

      return await User.create(userData);
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          attributes: ["name", "canUploadDocument", "canDeleteDocument"],
        },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Update user
  async updateUser(id: string, updateData: Partial<User>) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    // If updating email or username, check for conflicts
    if (updateData.email || updateData.username) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: updateData.email },
            { username: updateData.username },
          ],
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        throw new Error("Email or username already in use");
      }
    }

    // If role is being updated, validate it exists
    if (updateData.roleId) {
      const role = await Role.findByPk(updateData.roleId);
      if (!role) {
        throw new Error("Invalid role");
      }
    }

    return await user.update(updateData);
  }

  // Delete user
  async deleteUser(id: string) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    return await user.destroy();
  }

  // List users with optional filtering
  async listUsers(
    filters: {
      departmentId?: string;
      divisionId?: string;
      unitId?: string;
      isActive?: boolean;
    } = {}
  ) {
    return await User.findAll({
      where: filters,
      attributes: { exclude: ["password"] },
      include: [{ model: Role, attributes: ["name"] }],
    });
  }

  // Update last login
  async updateLastLogin(id: string) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    return await user.update({ lastLogin: new Date() });
  }
}

export default new UserService();
