import mongoose from "mongoose";
import { UserModel } from "./User";
export type AlertModel = mongoose.Document & {
  _id: number,
  hacker: UserModel,
  terminalId: string
};

const alertSchema = new mongoose.Schema({
   hacker: { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
   terminalId: String,
}, { timestamps: true });

const alertModel = mongoose.model("Alert", alertSchema);
export default alertModel;