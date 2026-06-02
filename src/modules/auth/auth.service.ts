import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signupIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role],
  );

  return result.rows[0];
};

const loginFromDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT id, name, email, password, role, created_at, updated_at
    FROM users
    WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials");
  }
  const user = userData.rows[0];

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret!, {
    expiresIn: "1d",
  });
  delete userData.rows[0].password
  return {Token : accessToken, Users : user}
};

export const authService = {
  signupIntoDB,
  loginFromDB,
};
