import bcrypt from "bcryptjs";
import { api, options, readBody, ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { validateCredentials } from "@/lib/validation";
import { publicUser } from "@/lib/auth";
import User from "@/models/User";

export const OPTIONS = options;
export const POST = api(async (request) => {
  const { name, email, password } = validateCredentials(
    await readBody(request),
    true,
  );
  await connectDB();
  // Ensure the unique index exists, including the first registration in a new database.
  await User.init();
  if (await User.exists({ email }))
    throw new ApiError(409, "An account with this email already exists.");
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
  });
  return Response.json(
    { user: publicUser(user), message: "Account created. Please log in." },
    { status: 201 },
  );
});
