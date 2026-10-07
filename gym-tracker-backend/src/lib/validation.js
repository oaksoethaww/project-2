import { ApiError } from "./api";

export const categories = ["Strength", "Cardio", "Flexibility", "Other"];

export function validateCredentials(body, registering = false) {
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!email || !password || (registering && !name))
    throw new ApiError(400, "All required fields must be filled in.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiError(400, "Enter a valid email address.");
  // bcrypt uses at most 72 bytes. Reject longer values rather than silently truncating.
  if (
    new TextEncoder().encode(password).length > 72 ||
    (registering && password.length < 8)
  ) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and no more than 72 bytes.",
    );
  }
  if (registering && name.length > 80)
    throw new ApiError(400, "Name must be at most 80 characters.");
  return { name, email, password };
}

export function validateWorkout(body) {
  const exercise =
    typeof body.exercise === "string" ? body.exercise.trim() : "";
  if (!exercise || exercise.length > 120)
    throw new ApiError(400, "Exercise must be between 1 and 120 characters.");
  if (!categories.includes(body.category))
    throw new ApiError(400, "Choose a valid category.");
  const workout = { exercise, category: body.category };
  for (const field of ["sets", "reps", "weight", "duration", "calories"]) {
    const value = body[field];
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1000000 ||
      (["sets", "reps"].includes(field) && !Number.isInteger(value))
    ) {
      throw new ApiError(
        400,
        `${field} must be a non-negative ${["sets", "reps"].includes(field) ? "whole number" : "number"} (maximum 1,000,000).`,
      );
    }
    workout[field] = value;
  }
  if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date))
    throw new ApiError(400, "Enter a valid workout date.");
  const date = new Date(`${body.date}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== body.date
  )
    throw new ApiError(400, "Enter a valid workout date.");
  workout.date = date;
  return workout;
}
