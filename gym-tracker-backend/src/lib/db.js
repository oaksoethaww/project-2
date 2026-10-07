import mongoose from "mongoose";

// Reuse a connection (and an in-flight connection) across Next.js hot reloads.
const cached =
  globalThis.gymDatabase || (globalThis.gymDatabase = { promise: null });

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    const error = new Error("Configure MONGODB_URI on the backend.");
    error.status = 503;
    throw error;
  }
  if (mongoose.connection.readyState === 1) return mongoose;
  if (mongoose.connection.readyState === 0) cached.promise = null;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch(() => {
        cached.promise = null;
        const error = new Error(
          "Database unavailable. Check the MongoDB connection.",
        );
        error.status = 503;
        throw error;
      });
  }
  return cached.promise;
}
