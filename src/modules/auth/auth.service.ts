import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const signupIntoDB = async (payload: IUser) => {
    const {name, email, password, role} = payload;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING id, name, email, role, created_at, updated_at
        `,
      [name, email, hashedPassword, role],
    );
    return result.rows[0]
};

const loginFromDB = async(payload : {email:string, password:string}) =>{
    const {email, password} = payload;
    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `,[email])

        if(userData.rows.length === 0){
            throw new Error("Invelided Credentials!!!")
        }
        const user = userData.rows[0]
        const matchPasswor = await bcrypt.compare(password, user.password);
        if (!matchPasswor) {
          throw new Error("Invelided Credentials!!!!!!!!!!!!!!!");
        }
        const jwtpayload = {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          is_actived: user.is_actived,
        };
        const accessToken = jwt.sign(jwtpayload, config.secret as string, {
          expiresIn: config.jwt_expires_in as any,
        });

        

        return { accessToken};


}




export const authService = {
  signupIntoDB,
  loginFromDB,
};
