import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "./api";
import { connectDB } from "./db";
import User from "@/models/User";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32)
    throw new ApiError(
      503,
      "Configure JWT_SECRET with at least 32 characters.",
    );
  return value;
}

export function createToken(user) {
  return jwt.sign({}, secret(), {
    subject: user._id.toString(),
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

export function verifyToken(token) {
  const key = secret();
  try {
    const payload = jwt.verify(token, key, { algorithms: ["HS256"] });
    if (
      !payload ||
      typeof payload === "string" ||
      !mongoose.isObjectIdOrHexString(payload.sub)
    )
      throw new Error();
    return payload.sub;
  } catch {
    throw new ApiError(
      401,
      "Your session has expired or is invalid. Please log in again.",
    );
  }
}

export async function requireUser(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer "))
    throw new ApiError(401, "Please log in to continue.");
  const id = verifyToken(header.slice(7));
  await connectDB();
  const user = await User.findById(id);
  if (!user)
    throw new ApiError(
      401,
      "Your account could not be found. Please log in again.",
    );
  return user;
}

export function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}
