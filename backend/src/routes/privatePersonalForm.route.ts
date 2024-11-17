import { Router } from "express";
import {
  CreatePersonalForm,
  GetPersonalForms,
  GetPersonalForm,
  DeletePersonalFormById,
  UpdatePersonalForm,
} from "../controllers/personalForm.controller";

const router = Router();

router.get("/get-personal-forms", GetPersonalForms);
router.get("/get-personal-form/:id", GetPersonalForm);
router.delete("/delete-personal-form/:id", DeletePersonalFormById);
router.put("/update-personal-form/:id", UpdatePersonalForm);

export default router;
