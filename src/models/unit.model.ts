import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { v4 as uuidv4 } from "uuid";
import Division from "./division.model";

interface UnitAttributes {
  id: string;
  divisionId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface UnitCreationAttributes
  extends Optional<UnitAttributes, "id" | "description" | "isActive"> {}

class Unit
  extends Model<UnitAttributes, UnitCreationAttributes>
  implements UnitAttributes
{
  public id!: string;
  public divisionId!: string;
  public name!: string;
  public description?: string;
  public isActive!: boolean;

  // Associations will be defined later
  public readonly division?: Division;
  public readonly users?: any[];
}

Unit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    divisionId: {
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
    modelName: "Unit",
    tableName: "units",
  }
);

export default Unit;
