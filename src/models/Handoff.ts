import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICustomField {
  label: string;
  value: string | number | boolean;
  type?: "text" | "number" | "toggle" | "select";
}

export interface IHandoff extends Document {
  patientId: Types.ObjectId;
  recordedBy: Types.ObjectId;
  acceptedBy?: Types.ObjectId;
  date: Date;
  mealAmount?: "많음" | "보통" | "적음" | null;
  excretionSleep: {
    urine: boolean;
    feces: boolean;
    sleep: boolean;
  };
  mobility?: string | null;
  emotion?: string | null;
  medications?: {
    morning: boolean;
    lunch: boolean;
    dinner: boolean;
    bedtime: boolean;
  };
  memo?: string;
  voiceMemoUrl?: string;
  customFields: ICustomField[];
  status: "draft" | "handed_off" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}

const CustomFieldSchema = new Schema<ICustomField>(
  {
    label: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: {
      type: String,
      enum: ["text", "number", "toggle", "select"],
      default: "text",
    },
  },
  { _id: false },
);

const HandoffSchema = new Schema<IHandoff>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    mealAmount: {
      type: String,
      enum: ["많음", "보통", "적음", null],
      default: null,
    },
    excretionSleep: {
      urine: { type: Boolean, default: true },
      feces: { type: Boolean, default: true },
      sleep: { type: Boolean, default: true },
    },
    mobility: { type: String, default: null },
    emotion: { type: String, default: null },
    medications: {
      morning: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false },
      bedtime: { type: Boolean, default: false },
    },
    memo: { type: String, default: "" },
    voiceMemoUrl: { type: String },
    customFields: { type: [CustomFieldSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "handed_off", "accepted"],
      default: "draft",
    },
  },
  { timestamps: true },
);

HandoffSchema.index({ patientId: 1, date: 1 }, { unique: true });

const Handoff: Model<IHandoff> =
  mongoose.models.Handoff ??
  mongoose.model<IHandoff>("Handoff", HandoffSchema);

export default Handoff;
