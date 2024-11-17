import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const jwtAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "No authorization header" });
    return;
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json({ message: "Invalid authorization format" });
    return;
  }

  try {
    // JWT'yi doğruluyoruz
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "defaultSecretKey"
    ) as { email: string };

    const { email } = decoded;

    // E-posta ortam değişkeni ile eşleşiyor mu?
    if (email === process.env.USER_EMAIL) {
      next(); // Middleware geçişi, kullanıcı doğrulandı
    } else {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
