import { api, options, readBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { validateWorkout } from "@/lib/validation";
import Workout from "@/models/Workout";

export const OPTIONS = options;
export const GET = api(async (request) => {
  const user = await requireUser(request);
  const workouts = await Workout.find({ userId: user._id })
    .sort({ date: -1, createdAt: -1 })
    .lean();
  return Response.json({ workouts });
});
export const POST = api(async (request) => {
  const user = await requireUser(request);
  const values = validateWorkout(await readBody(request));
  const workout = await Workout.create({ ...values, userId: user._id });
  return Response.json({ workout }, { status: 201 });
});
