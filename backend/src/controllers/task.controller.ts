import { Request, Response } from "express";
import Task from "../models/Task";
import { catchAsync } from "../utils/catchAsync";

export class TaskController {
  static createTask = catchAsync(async (req: any, res: Response) => {
    const { tenantId, _id: userId } = req.user;
    const task = await Task.create({ ...req.body, tenantId, createdBy: userId });
    res.status(201).json({ success: true, data: task });
  });

  static getTasks = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const tasks = await Task.find({ tenantId })
      .populate("assignedTo", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  });

  static updateTask = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;
    const task = await Task.findOneAndUpdate({ _id: id, tenantId }, req.body, { new: true });
    res.json({ success: true, data: task });
  });

  static deleteTask = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;
    await Task.findOneAndDelete({ _id: id, tenantId });
    res.json({ success: true, message: "Task Decoupled" });
  });
}
