import express from "express";
import DepartmentController from "../controllers/departmentController";

const router = express.Router();

router.post("/create_department", DepartmentController.createDepartment);
router.get("/list_departments", DepartmentController.listDepartments);
router.get("/get_department/:id", DepartmentController.getDepartmentById);
router.put("/update_department/:id", DepartmentController.updateDepartment);
router.delete("/delete_department:id", DepartmentController.deleteDepartment);

export default router;
