import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { v4 as uuidv4 } from "uuid";

interface RoleAttributes {
  id: string;
  name: string;
  description?: string;
  canUploadDocument: boolean;
  canDeleteDocument: boolean;
}

interface RoleCreationAttributes
  extends Optional<RoleAttributes, "id" | "description"> {}

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: string;
  public name!: string;
  public description?: string;
  public canUploadDocument!: boolean;
  public canDeleteDocument!: boolean;

  // Association
  public readonly users?: any[];
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    canUploadDocument: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canDeleteDocument: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
  }
);

export default Role;
