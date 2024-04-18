import { Request, Response } from "express";
import UserModel from "../models/user.model";

export const createOrGetUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as IUser;
    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required", success: false });
    }

    const existingUser = await UserModel.findOne({ email });

    let user: IUser;

    if (existingUser) {
      user = existingUser;
    } else {
      user = await UserModel.create({ email });
    }

    console.log(user);

    res.status(200).json({ data: user, success: true });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
};
