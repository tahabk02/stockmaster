import { Response } from "express";
import Attendance from "../models/Attendance";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export class HRController {
  static clockIn = catchAsync(async (req: any, res: Response) => {
    const { tenantId, _id: userId } = req.user;
    const today = new Date().setHours(0,0,0,0);

    const existing = await Attendance.findOne({ userId, tenantId, date: today });
    if (existing) throw new AppError("Agent already synchronized for this cycle", 400);

    const attendance = await Attendance.create({
      tenantId,
      userId,
      date: today,
      clockIn: new Date(),
      status: "ON_TIME", // Simple logic for now
      location: req.body.location
    });

    res.status(201).json({ success: true, data: attendance });
  });

  static clockOut = catchAsync(async (req: any, res: Response) => {
    const { tenantId, _id: userId } = req.user;
    const today = new Date().setHours(0,0,0,0);

    const attendance = await Attendance.findOneAndUpdate(
      { userId, tenantId, date: today },
      { clockOut: new Date() },
      { new: true }
    );

    if (!attendance) throw new AppError("No active session found", 404);
    res.json({ success: true, data: attendance });
  });

  static getMyAttendance = catchAsync(async (req: any, res: Response) => {
    const { tenantId, _id: userId } = req.user;
    const records = await Attendance.find({ userId, tenantId }).sort({ date: -1 });
    res.json({ success: true, data: records });
  });

  static getTeamAttendance = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const records = await Attendance.find({ tenantId }).populate("userId", "name role avatar").sort({ date: -1 });
    res.json({ success: true, data: records });
  });
}
