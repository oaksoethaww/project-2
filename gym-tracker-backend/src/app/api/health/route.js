import { api, options } from "@/lib/api";
export const OPTIONS = options;
export const GET = api(() =>
  Response.json({ status: "ok", service: "gym-tracker-backend" }),
);
