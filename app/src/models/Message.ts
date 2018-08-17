import mongoose from "mongoose";
import { UserModel } from "./User";
export type MessageModel = mongoose.Document & {
  _id: number,
  body: string,
  recipient: UserModel,
  replyTo: MessageModel,
  sender: UserModel,
  title: string
};

const messangeSchema = new mongoose.Schema({
   _id: { type: Number, unique: true },
   body: String,
   recipient: { type: String, ref: "User" },
   replyTo: { type: Number, ref: "Message" },
   sender: { type: String, ref: "User" },
   title: String,
}, );

const messangeModel = mongoose.model("Message", messangeSchema);
export default messangeModel;