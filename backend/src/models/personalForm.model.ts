import { Schema, model, Document } from "mongoose";

export interface PersonalForm extends Document {
  _id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  accepted: boolean;
}

const PersonalFormSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  accepted: { type: Boolean, required: true },
});

const PersonalFormModel = model<PersonalForm>(
  "PersonalForm",
  PersonalFormSchema
);

export default PersonalFormModel;
