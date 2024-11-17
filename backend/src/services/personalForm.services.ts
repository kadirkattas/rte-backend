import PersonalFormModel from "../models/personalForm.model";
import { PersonalForm } from "../models/personalForm.model";

export const CreateAPersonalForm = async (personalFormData: PersonalForm) => {
  const newPersonalForm = new PersonalFormModel(personalFormData); // Creates a new personal form
  await newPersonalForm.save(); // Save the new personal form
  return newPersonalForm; // Return the new personal form
};

export const GetAllPersonalForms = async () => {
  return await PersonalFormModel.find(); // Return all personal forms
};

export const GetPersonalFormById = async (id: string) => {
  return await PersonalFormModel.findById(id); // Return a personal form by id
};

export const DeleteAPersonalFormById = async (id: string) => {
  return await PersonalFormModel.findByIdAndDelete(id); // Delete a personal form by id
};

export const UpdatePersonalFormById = async (
  personalFormData: PersonalForm,
  id: string
) => {
  // Update a personal form by id
  await DeleteAPersonalFormById(id); // Delete a question package by id
  personalFormData._id = id;

  const savedPersonalFormData = await CreateAPersonalForm(personalFormData);
  return savedPersonalFormData; // Return the updated question package
};
