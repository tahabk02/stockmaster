import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export class AuthService {
  static generateToken(user: any): string {
    // السر كامل كاين ف هاد السطر: خاصنا نزيدو tenantId
    return jwt.sign(
      {
        id: user._id,
        _id: user._id, // Add this for compatibility
        email: user.email,
        tenantId: user.tenantId, // هادي هي اللي ناقصاك!
        role: user.role,
      },
      ENV.JWT_SECRET || "your_secret_key",
      { expiresIn: "24h" },
    );
  }
}
