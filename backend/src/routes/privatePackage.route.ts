import { Router } from "express";
import {
  CreateQuestionPackages,
  GetQuestionPackages,
  DeleteQuestionPackageById,
  GetQuestionPackage,
  UpdateQuestionPackage,
} from "../controllers/questionPackage.controller";


const router = Router();

// Routes for question packages
router.post("/create-package", CreateQuestionPackages);
router.get("/get-packages", GetQuestionPackages);
router.get("/get-package/:id", GetQuestionPackage);
router.delete("/delete-package/:id", DeleteQuestionPackageById);
router.put("/update-package/:id", UpdateQuestionPackage);


export default router;


