import mongoose from "mongoose";
import { UserModel } from "./User";
export type NewsModel = mongoose.Document & {
  _id: number,
  body: string,
  author: UserModel,
  title: string
};

const newsSchema = new mongoose.Schema({
   body: String,
   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
   title: String,
}, { timestamps: true });

const newsModel = mongoose.model("News", newsSchema);
export default newsModel;

export const newsImportFields = [
      "author",
      "title",
      "body"
  ];