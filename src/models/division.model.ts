import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { v4 as uuidv4 } from "uuid";
import Department from "./department.model";

interface DivisionAttributes {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface DivisionCreationAttributes
  extends Optional<DivisionAttributes, "id" | "description" | "isActive"> {}

class Division
  extends Model<DivisionAttributes, DivisionCreationAttributes>
  implements DivisionAttributes
{
  public id!: string;
  public departmentId!: string;
  public name!: string;
  public description?: string;
  public isActive!: boolean;

  // Associations will be defined later
  public readonly department?: Department;
  public readonly units?: any[];
  public readonly users?: any[];
}

Division.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    modelName: "Division",
    tableName: "divisions",
  }
);

export default Division;
