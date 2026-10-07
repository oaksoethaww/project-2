import { api, options } from "@/lib/api";
import { requireUser, publicUser } from "@/lib/auth";

export const OPTIONS = options;
export const GET = api(async (request) =>
  Response.json({ user: publicUser(await requireUser(request)) }),
);
