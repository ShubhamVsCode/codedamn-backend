import { model, Schema } from "mongoose";

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  containerName: {
    type: String,
    required: true,
    unique: true,
  },
  containerStatus: {
    type: String,
    required: true,
    enum: ["pending", "running", "stopped"],
  },
  containerPort: {
    type: String,
  },
});

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
