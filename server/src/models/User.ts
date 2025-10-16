import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string;
  googleId?: string;
  refreshToken?: string;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    password: String,       // For normal signups
    googleId: String,       // For Google sign-ins
    refreshToken: String,   // Store refresh token
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
