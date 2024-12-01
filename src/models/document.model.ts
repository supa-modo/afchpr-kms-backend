import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { v4 as uuidv4 } from "uuid";
import User from "./user.model";
import Department from "./department.model";
import Division from "./division.model";
import Unit from "./unit.model";

// Enum for privacy levels
export enum DocumentPrivacyLevel {
  PUBLIC = "public",
  DEPARTMENT = "department",
  DIVISION = "division",
  UNIT = "unit",
}

interface DocumentAttributes {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  creatorId: string;
  privacyLevel: DocumentPrivacyLevel;
  departmentId?: string;
  divisionId?: string;
  unitId?: string;
  versionNumber: number;
  isActive: boolean;
}

interface DocumentCreationAttributes
  extends Optional<
    DocumentAttributes,
    "id" | "description" | "versionNumber" | "isActive"
  > {}

class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  public id!: string;
  public title!: string;
  public description?: string;
  public filePath!: string;
  public fileType!: string;
  public fileSize!: number;
  public uploadDate!: Date;
  public creatorId!: string;
  public privacyLevel!: DocumentPrivacyLevel;
  public departmentId?: string;
  public divisionId?: string;
  public unitId?: string;
  public versionNumber!: number;
  public isActive!: boolean;

  // Associations
  public readonly creator?: User;
  public readonly department?: Department;
  public readonly division?: Division;
  public readonly unit?: Unit;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    uploadDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    privacyLevel: {
      type: DataTypes.ENUM(...Object.values(DocumentPrivacyLevel)),
      allowNull: false,
      defaultValue: DocumentPrivacyLevel.PUBLIC,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    divisionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "documents",
  }
);

export default Document;
