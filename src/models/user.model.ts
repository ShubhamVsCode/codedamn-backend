import { model, Schema } from "mongoose";

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isSandboxRunning: {
    type: Boolean,
    default: false,
  },
});

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
