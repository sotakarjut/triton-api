import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";

export type RoleModel = mongoose.Document & {
  _id: string
  canHack: boolean,
  canImpresonate: boolean,
  hackerLevel: number
};

const roleSchema = new mongoose.Schema({
   _id: String,
   canHack: Boolean,
   canImpresonate: Boolean,
   hackerLevel: Number
}, );

const roleModel = mongoose.model("Role", roleSchema);
export default roleModel;