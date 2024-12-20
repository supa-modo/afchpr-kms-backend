import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import sequelize from "./config/database";
import { initializeAssociations } from "./models/associations";

// Import models to ensure they are initialized
import "./models/user.model";
import "./models/role.model";
import "./models/department.model";
import "./models/division.model";
import "./models/unit.model";

// Import routes
import userRoutes from "./routes/userRoutes";
import roleRoutes from "./routes/roleRoutes";
import authRoutes from "./routes/authRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import divisionRoutes from "./routes/divisionRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/divisions", divisionRoutes);

// Database Connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    //Initializing model associations
    initializeAssociations();

    // Sync models
    return sequelize.sync({
      alter: true,

      // force: true  // Uncomment to reset tables (development only)
    });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

export default app;
