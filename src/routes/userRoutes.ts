import express from "express";
import UserController from "../controllers/userController";

const router = express.Router();

// User routes
router.post("/create_user", UserController.createUser);
router.get("/get_user/:id", UserController.getUserById);
router.put("/update_user/:id", UserController.updateUser);
router.delete("/delete_user/:id", UserController.deleteUser);
router.get("/list_users", UserController.listUsers);

export default router;
