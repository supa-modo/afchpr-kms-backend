import express from "express";
import RoleController from "../controllers/roleController";

const router = express.Router();

// Role routes
router.post("/create_role", RoleController.createRole);
router.get("/get_role/:id", RoleController.getRoleById);
router.put("/update_role/:id", RoleController.updateRole);
router.delete("/delete_role/:id", RoleController.deleteRole);
router.get("/list_roles", RoleController.listRoles);

export default router;
