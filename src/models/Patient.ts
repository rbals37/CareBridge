import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: "male" | "female";
  ward?: string;
  room: string;
  bed: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    ward: { type: String },
    room: { type: String, required: true },
    bed: { type: String, required: true },
  },
  { timestamps: true },
);

PatientSchema.index({ room: 1, bed: 1 }, { unique: true });

const Patient: Model<IPatient> =
  mongoose.models.Patient ??
  mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
