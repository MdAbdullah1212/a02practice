import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(roles);
    try {
      const token = req.headers.authorization;
      //  console.log(token)
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthoraiz access!!!!!",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;
      //  console.log("decoded ", decoded)
      const userData = await pool.query(
        `
      SELECT * FROM users WHERE email=$1
      `,
        [decoded.email],
      );
      // console.log(userData)
      const user = userData.rows[0];
      console.log(user);
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "user not found",
        });
      }
      if (!user.is_actived) {
        res.status(403).json({
          success: false,
          message: "forbidden",
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "forbidden",
        });
      }
      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
