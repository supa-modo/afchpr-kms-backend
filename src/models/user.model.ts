import {
  Model,
  DataTypes,
  Optional,
  ValidationError,
  ValidationErrorItem,
  ValidationErrorItemType,
} from "sequelize";
import sequelize from "../config/database";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  divisionId?: string;
  unitId?: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "isActive" | "lastLogin"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public departmentId?: string;
  public divisionId?: string;
  public unitId?: string;
  public roleId!: string;
  public isActive!: boolean;
  public passwordResetToken?: string;
  public passwordResetExpiry?: Date;

  // Method to check password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Method to hash password before save
  public async hashPassword(): Promise<void> {
    if (this.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          await user.hashPassword();
        }
      },
      beforeValidate: (user: User) => {
        // Username validation
        if (user.username) {
          user.username = user.username.trim().toLowerCase();
          if (user.username.length < 3 || user.username.length > 50) {
            throw new ValidationError("Validation Error", [
              new ValidationErrorItem(
                "Username must be between 3 and 50 characters", // message
                ValidationErrorItemType["string violation"], // type
                "username", // path
                user.username, // value
                user, // instance
                "length", // validatorKey
                "beforeValidate", // fnName
                [3, 50] // fnArgs
              ),
            ]);
          }
        }

        // Email validation
        if (user.email) {
          user.email = user.email.trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(user.email)) {
            throw new ValidationError("Validation Error", [
              new ValidationErrorItem(
                "Invalid email format", // message
                ValidationErrorItemType["string violation"], // type
                "email", // path
                user.email, // value
                user, // instance
                "format", // validatorKey
                "beforeValidate", // fnName
                [emailRegex] // fnArgs
              ),
            ]);
          }
        }
      },
    },
  }
);

export default User;
