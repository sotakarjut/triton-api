import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";

export type RoleModel = mongoose.Document & {
  _id: number,
  canBeHacked: boolean,
  canHack: boolean,
  canImpersonate: boolean,
  hackerLevel: number,
  name: string
};

const roleSchema = new mongoose.Schema({
   canBeHacked: Boolean,
   canHack: Boolean,
   canImpersonate: Boolean,
   hackerLevel: Number,
   name: { type: String, unique: true }
}, );

const roleModel = mongoose.model("Role", roleSchema);
export default roleModel;

export const roleImportFields = [
      "name",
      "canImpersonate",
      "canHack",
      "canBeHacked",
      "hackerLevel"
  ];