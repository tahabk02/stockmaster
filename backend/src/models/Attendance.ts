import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  tenantId: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  status: "ON_TIME" | "LATE" | "ABSENT";
  location?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

const AttendanceSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  status: { type: String, enum: ["ON_TIME", "LATE", "ABSENT"], default: "ON_TIME" },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
