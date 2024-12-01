import User from "./user.model";
import Department from "./department.model";
import Division from "./division.model";
import Unit from "./unit.model";
import Role from "./role.model";
import Document from "./document.model";

// Define all model associations
export function initializeAssociations() {
  // Role - User associations
  Role.hasMany(User, {
    foreignKey: "roleId",
    as: "users",
  });
  User.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  });

  // Department - Division associations
  Department.hasMany(Division, {
    foreignKey: "departmentId",
    as: "divisions",
  });
  Division.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
  });

  // Division - Unit associations
  Division.hasMany(Unit, {
    foreignKey: "divisionId",
    as: "units",
  });
  Unit.belongsTo(Division, {
    foreignKey: "divisionId",
    as: "division",
  });

  // User - Organizational Hierarchy associations
  Department.hasMany(User, {
    foreignKey: "departmentId",
    as: "users",
  });
  User.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
  });

  Division.hasMany(User, {
    foreignKey: "divisionId",
    as: "users",
  });
  User.belongsTo(Division, {
    foreignKey: "divisionId",
    as: "division",
  });

  Unit.hasMany(User, {
    foreignKey: "unitId",
    as: "users",
  });
  User.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  // Document associations
  User.hasMany(Document, {
    foreignKey: "creatorId",
    as: "documents",
  });
  Document.belongsTo(User, {
    foreignKey: "creatorId",
    as: "creator",
  });

  Document.belongsTo(Department, {
    foreignKey: "departmentId",
    as: "department",
  });
  Document.belongsTo(Division, {
    foreignKey: "divisionId",
    as: "division",
  });
  Document.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });
}
