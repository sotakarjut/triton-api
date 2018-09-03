import mongoose from "mongoose";
import { UserModel } from "./User";
export type MailingListModel = mongoose.Document & {
  _id: number,
  members: UserModel[],
  name: string,
};

const mailingListSchema = new mongoose.Schema({
   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
   name: String,
});

const mailingListModel = mongoose.model("MailingList", mailingListSchema);

export default mailingListModel;

export const mailingListImportFields = [
  "username"
];