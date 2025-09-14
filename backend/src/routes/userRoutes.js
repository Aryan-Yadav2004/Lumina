import { Router } from "express";
import { login, register } from "../controllers/userControllers.js";

const router = Router();
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity");
router.route("/get-all-activity");

export default router;