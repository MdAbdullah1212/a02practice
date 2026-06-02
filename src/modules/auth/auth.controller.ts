import type { Request, Response } from "express";
import { sendResponse } from "../../utility/sendResponse";
import { authService } from "./auth.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};


const loginUser = async (req: Request, res: Response) => {
    try {

        // const result = await authController.loginUser()
    //   sendResponse(res, {
    //     statusCode: 201,
    //     success: true,
    //     message: "User Signup Successfully",
    //     data: result,
    //   });
    } catch (error: any) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: error.message,
      });
    }
}
export const authController = {
  signupUser, loginUser
};
