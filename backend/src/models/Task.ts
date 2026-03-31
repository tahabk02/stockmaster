import mongoose, { Schema, Document } from "mongoose";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export interface ITask extends Document {
  tenantId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
  priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dueDate: { type: Date },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
