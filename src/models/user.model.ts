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
  public lastLogin?: Date;

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

        // Password complexity validation
        if (user.password) {
          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordRegex.test(user.password)) {
            throw new ValidationError("Validation Error", [
              new ValidationErrorItem(
                "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character", // message
                ValidationErrorItemType["string violation"], // type
                "password", // path
                user.password, // value
                user, // instance
                "complexity", // validatorKey
                "beforeValidate", // fnName
                [passwordRegex] // fnArgs
              ),
            ]);
          }
        }
      },
    },
  }
);

export default User;
