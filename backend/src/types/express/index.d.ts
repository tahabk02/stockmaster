import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        _id: string;
        email: string;
        role: string;
        tenantId: string;
        [key: string]: any;
      };
    }
  }
}
