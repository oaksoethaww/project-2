import bcrypt from "bcryptjs";
import { api, options, readBody, ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { validateCredentials } from "@/lib/validation";
import { createToken, publicUser } from "@/lib/auth";
import User from "@/models/User";

export const OPTIONS = options;
export const POST = api(async (request) => {
  const { email, password } = validateCredentials(await readBody(request));
  await connectDB();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new ApiError(401, "Invalid email or password.");
  return Response.json({ token: createToken(user), user: publicUser(user) });
});
