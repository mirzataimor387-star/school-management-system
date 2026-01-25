import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "./connectdb";
import { cookies } from "next/headers";

export async function getAuthUser() {
  await dbConnect();

  const token = cookies().get("token")?.value;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select(
    "_id role campusId"
  );

  if (!user) return null;

  return {
    id: user._id.toString(),
    role: user.role,
    campusId: user.campusId?.toString() || null,
  };
}
