import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post(
  "/signup",
  auth(USER_ROLE.mantainer, USER_ROLE.contributor),
  authController.signupUser,
);
router.post("/login", authController.loginUser);

export const authRoute = router;
