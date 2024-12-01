import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { v4 as uuidv4 } from "uuid";

interface DepartmentAttributes {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface DepartmentCreationAttributes
  extends Optional<DepartmentAttributes, "id" | "description" | "isActive"> {}

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: string;
  public name!: string;
  public description?: string;
  public isActive!: boolean;

  // Associations will be defined later
  public readonly divisions?: any[];
  public readonly users?: any[];
}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Department",
    tableName: "departments",
  }
);

export default Department;
