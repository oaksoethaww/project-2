import mongoose from "mongoose";
import { api, options, readBody, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { validateWorkout } from "@/lib/validation";
import Workout from "@/models/Workout";

export const OPTIONS = options;
async function filterFor(request, context) {
  const user = await requireUser(request);
  const { id } = await context.params;
  if (!mongoose.isObjectIdOrHexString(id))
    throw new ApiError(400, "Invalid workout ID.");
  return { _id: id, userId: user._id };
}
export const PUT = api(async (request, context) => {
  const filter = await filterFor(request, context);
  const values = validateWorkout(await readBody(request));
  const workout = await Workout.findOneAndUpdate(
    filter,
    { $set: values },
    { returnDocument: "after", runValidators: true },
  );
  if (!workout) throw new ApiError(404, "Workout not found.");
  return Response.json({ workout });
});
export const DELETE = api(async (request, context) => {
  const filter = await filterFor(request, context);
  const workout = await Workout.findOneAndDelete(filter);
  if (!workout) throw new ApiError(404, "Workout not found.");
  return Response.json({ message: "Workout deleted." });
});
