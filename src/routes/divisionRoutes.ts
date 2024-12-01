import express from "express";
import DivisionController from "../controllers/divisionController";

const router = express.Router();

router.post("/create_division", DivisionController.createDivision);
router.get("/list_divisions", DivisionController.listDivisions);
router.get("/get_division/:id", DivisionController.getDivisionById);
router.put("/update_division/:id", DivisionController.updateDivision);
router.delete("/delete_division/:id", DivisionController.deleteDivision);

export default router;
