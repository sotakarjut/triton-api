import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";

export type RoleModel = mongoose.Document & {
  _id: number,
  canHack: boolean,
  canImpresonate: boolean,
  hackerLevel: number,
  name: string
};

const roleSchema = new mongoose.Schema({
   canHack: Boolean,
   canImpresonate: Boolean,
   hackerLevel: Number,
   name: { type: String, unique: true }
}, );

const roleModel = mongoose.model("Role", roleSchema);
export default roleModel;