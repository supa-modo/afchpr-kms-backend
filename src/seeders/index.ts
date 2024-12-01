import sequelize from "../config/database";
import Role from "../models/role.model";
import Department from "../models/department.model";
import Division from "../models/division.model";
import Unit from "../models/unit.model";
import User from "../models/user.model";
import { v4 as uuidv4 } from "uuid";

class DatabaseSeeder {
  static async seedRoles() {
    const roles = [
      {
        id: uuidv4(),
        name: "System Admin",
        description: "Full system access",
        canUploadDocument: true,
        canDeleteDocument: true,
      },
      {
        id: uuidv4(),
        name: "Department Manager",
        description: "Department-level access",
        canUploadDocument: true,
        canDeleteDocument: false,
      },
      {
        id: uuidv4(),
        name: "Division Manager",
        description: "Department-level access",
        canUploadDocument: true,
        canDeleteDocument: true,
      },
      {
        id: uuidv4(),
        name: "Unit Manager",
        description: "Department-level access",
        canUploadDocument: true,
        canDeleteDocument: true,
      },
      {
        id: uuidv4(),
        name: "Regular Staff",
        description: "Basic user access",
        canUploadDocument: false,
        canDeleteDocument: false,
      },
    ];

    await Role.bulkCreate(roles, {
      ignoreDuplicates: true,
    });
    return roles;
  }

  static async seedDepartments() {
    const departments = [
      {
        id: uuidv4(),
        name: "Human Resources",
        description: "Manages personnel and organizational culture",
      },
      {
        id: uuidv4(),
        name: "Information Technology",
        description: "Manages technological infrastructure",
      },
      {
        id: uuidv4(),
        name: "Finance",
        description: "Manages financial operations",
      },
    ];

    await Department.bulkCreate(departments, {
      ignoreDuplicates: true,
    });
    return departments;
  }

  static async seedDivisions() {
    const departments = await Department.findAll();
    const divisions = [
      {
        id: uuidv4(),
        departmentId: departments[0].id, // HR
        name: "Recruitment",
        description: "Talent acquisition division",
      },
      {
        id: uuidv4(),
        departmentId: departments[0].id, // HR
        name: "Training & Development",
        description: "Employee skill development",
      },
      {
        id: uuidv4(),
        departmentId: departments[1].id, // IT
        name: "Infrastructure",
        description: "Network and hardware management",
      },
      {
        id: uuidv4(),
        departmentId: departments[1].id, // IT
        name: "Software Development",
        description: "Application development team",
      },
    ];

    await Division.bulkCreate(divisions, {
      ignoreDuplicates: true,
    });
    return divisions;
  }

  static async seedUnits() {
    const divisions = await Division.findAll();
    const units = [
      {
        id: uuidv4(),
        divisionId: divisions[0].id, // HR Recruitment
        name: "Campus Recruitment",
        description: "University and college hiring",
      },
      {
        id: uuidv4(),
        divisionId: divisions[1].id, // HR Training
        name: "Leadership Development",
        description: "Executive and management training",
      },
    ];

    await Unit.bulkCreate(units, {
      ignoreDuplicates: true,
    });
    return units;
  }

  static async seedUsers() {
    const roles = await Role.findAll();
    const departments = await Department.findAll();
    const divisions = await Division.findAll();
    const units = await Unit.findAll();

    const users = [
      {
        id: uuidv4(),
        username: "admin",
        email: "admin@company.com",
        password: "AdminPassword123!",
        firstName: "System",
        lastName: "Administrator",
        roleId: roles[0].id, // System Admin
        departmentId: departments[1].id, // IT Department
        divisionId: divisions[2].id, // IT Infrastructure
        isActive: true,
      },
      {
        id: uuidv4(),
        username: "hrmanager",
        email: "hrmanager@company.com",
        password: "HRManager123!",
        firstName: "HR",
        lastName: "Manager",
        roleId: roles[1].id, // Department Manager
        departmentId: departments[0].id, // HR Department
        divisionId: divisions[0].id, // HR Recruitment
        isActive: true,
      },
    ];

    // Use model methods to handle password hashing
    for (const userData of users) {
      await User.create(userData);
    }

    return users;
  }

  static async runSeeder() {
    try {
      // Seed in correct order to respect foreign key constraints
      await this.seedRoles();
      await this.seedDepartments();
      await this.seedDivisions();
      await this.seedUnits();
      await this.seedUsers();

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Seeding failed:", error);
    }
  }
}

// Export a function to run seeding
export async function seed() {
  await DatabaseSeeder.runSeeder();
}
