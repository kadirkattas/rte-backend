import { Request, Response } from "express";
import {
  CreateAPersonalForm,
  GetAllPersonalForms,
  GetPersonalFormById,
  DeleteAPersonalFormById,
  UpdatePersonalFormById,
} from "../services/personalForm.services";

export const CreatePersonalForm = async (req: Request, res: Response) => {
  try {
    const personalFormData = req.body;
    const savedPersonalFormData = await CreateAPersonalForm(personalFormData);
    res
      .status(201)
      .json({ message: "Personal form created", id: savedPersonalFormData.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const GetPersonalForms = async (req: Request, res: Response) => {
  try {
    const personalForms = await GetAllPersonalForms();
    res.status(200).json({ message: "Personal forms fetched", personalForms });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const GetPersonalForm = async (req: Request, res: Response) => {
  try {
    const personalForm = await GetPersonalFormById(req.params.id);
    if (!personalForm) {
      res.status(404).json({ message: "Personal form not found" });
      return;
    }
    res.status(200).json({ message: "Personal form fetched", personalForm });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const DeletePersonalFormById = async (req: Request, res: Response) => {
  try {
    await DeleteAPersonalFormById(req.params.id);
    res.status(200).json({ message: "Personal form deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const UpdatePersonalForm = async (req: Request, res: Response) => {
  try {
    const personalForm = req.body;
    const updatedPersonalForm = await UpdatePersonalFormById(
      personalForm,
      req.params.id
    );
    res
      .status(200)
      .json({ message: "Personal form updated", updatedPersonalForm });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
