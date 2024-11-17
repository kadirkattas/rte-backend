import { Request, Response } from "express";
import AuthService from "../services/authservices"; // AuthService'den bahsettiğinize göre var diye düşündüm
import jwt from "jsonwebtoken";

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const authenticated = await AuthService.authenticate(email, password);

      if (!authenticated) {
        res.status(401).json({ message: "Login failed" });
        return;
      }

      // Kullanıcıyı doğruladıktan sonra JWT token oluştur
      const token = jwt.sign(
        { email }, // Payload: email'i token içine ekliyoruz
        process.env.JWT_SECRET_KEY || "defaultSecretKey", // Secret key, çevre değişkenlerinde tanımlanmalı
        { expiresIn: "30s" } // Token geçerlilik süresi: 1 saat
      );
      const refreshToken = jwt.sign(
        { email }, // Payload: email'i token içine ekliyoruz
        process.env.JWT_REFRESH_SECRET_KEY || "defaultRefreshSecretKey", // Secret key, çevre değişkenlerinde tanımlanmalı
        { expiresIn: "1d" } // Token geçerlilik süresi: 1 saat
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });

      res.cookie("jwtToken", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 30 * 1000, // 30 seconds
      });

      res.json({ message: "Logged in", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  public static async HandleRefreshToken(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const cookies = req.cookies;

      if (!cookies?.jwt) {
        res.status(401).json({ message: "No refresh token provided" });
        return;
      }

      const refreshToken = cookies.jwt;

      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY || "defaultRefreshSecretKey",
        (err: jwt.VerifyErrors | null, decoded: any) => {
          if (err || process.env.USER_EMAIL !== decoded.email) {
            return res.status(401).json({ message: "Unauthorized" });
          }

          // Yeni bir access token oluşturuyoruz
          const newAccessToken = jwt.sign(
            { email: decoded.email },
            process.env.JWT_SECRET_KEY || "defaultSecretKey",
            { expiresIn: "30s" }
          );
          res.cookie("jwtToken", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 1000 * 30, // 30 sec
          });
          res.json({ message: "Token refreshed", token: newAccessToken });
        }
      );
    } catch (error) {
      console.error("Error during refresh token:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async Logout(req: Request, res: Response): Promise<void> {
    try {
      const cookies = req.cookies;

      if (!cookies?.jwt) {
        res.status(401);
        return;
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      res.clearCookie("jwtToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
