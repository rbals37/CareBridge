import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPatient extends Document {
  ownerId: Types.ObjectId;
  caregiverIds: Types.ObjectId[];
  name: string;
  age: number;
  gender: "male" | "female";
  ward?: string;
  room: string;
  bed: string;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    caregiverIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    ward: { type: String },
    room: { type: String, required: true },
    bed: { type: String, required: true },
    inviteCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

PatientSchema.index({ ownerId: 1, room: 1, bed: 1 }, { unique: true });

const Patient: Model<IPatient> =
  mongoose.models.Patient ??
  mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
